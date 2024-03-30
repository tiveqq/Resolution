export default class Formula {
    #args;

    constructor(...args) {
        this.#args = args;
    }
    // Methods to return a formula that applied a connective to this formula
    not() {
        return new Formula.#Negation(this);
    }

    static trueConstant() {
        return new this.#True();
    }

    static falseConstant() {
        return new this.#False();
    }
    and(other) {
        return new Formula.#Conjunction(this, other);
    }
    or(other) {
        return new Formula.#Disjunction(this, other);
    }
    implies(other) {
        return new Formula.#Conditional(this, other);
    }

    equiv(other) {
        return new Formula.#Equivalence(this, other);
    }

    // ==== Methods that can be overridden by the subclasses ====

    // Evaluate the formula using explicit FALSE/TRUE values.
    // A Variable will evaluate to TRUE if and only when it is in
    //      the Set that is given as argument.
    evaluate(trueVariables) {
        // Default is undefined: subclass MUST override and return boolean
    }
    toString() {
        // Default: subclass can override
        return this.#stringifyArgs().join(this.constructor.symbol);
    }
    // Return whether this formula is in CNF format
    // If level is provided, it verifies whether this formula 
    //    can be at that level within a CNF structure.
    isCnf(level=0) {
        return false; // Default: subclass can override 
    }
    // Return an equivalent formula that is in CNF format
    cnf() {
        return this; // Default: subclass MUST override
    }
    // Get list of all variables used in this formula
    usedVariables() {
        // Formula.Variable should override this
        return [...new Set(this.#args.flatMap(arg => arg.usedVariables()))];
    }



    // ==== Methods that are fully implemented (no need to override) ====

    // Brute-force way to compare whether two formulas are equivalent:
    //    It provides all the used variables all possible value combinations,
    //    and compares the outcomes.
    equivalent(other) {
        const usedVariables = [...new Set(this.usedVariables().concat(other.usedVariables()))];
        const trueVariables = new Set;

        const recur = (i) => {
            if (i >= usedVariables.length) {
                // All usedVariables have a value. Make the evaluation
                return this.evaluate(trueVariables) === other.evaluate(trueVariables);
            }
            trueVariables.delete(usedVariables[i]);
            if (!recur(i + 1)) return false;
            trueVariables.add(usedVariables[i]);
            return recur(i + 1);
        };

        return recur(0);
    }
    // Utility functions for mapping the args member
    #cnfArgs() {
        return this.#args.map(arg => arg.cnf());
    }
    #negatedArgs() {
        return this.#args.map(arg => arg.not());
    }
    #evalArgs(trueVariables) {
        return this.#args.map(arg => arg.evaluate(trueVariables));
    }
    #stringifyArgs() {
        return this.#args.length < 2 ? this.#args.map(String) // No parentheses needed
            : this.#args.map(arg => arg.#args.length > 1 ? "(" + arg + ")" : arg + "");
    }
    // Giving a more verbose output than toString(). For debugging.
    dump(indent="") {
        return [
            indent + this.constructor.name + " (",
            ...this.#args.map(arg => arg.dump(indent + "  ")),
            indent + ")"
        ].join("\n");
    }

    // ==== Static members ====
    // Collection of all the variables used in any formula, keyed by name
    static #variables = new Map;
    // Get or create a variable, avoiding different instances for the same name
    static getVariable(name) {
        return this.#variables.get(name)
            ?? this.#variables.set(name, new this.#Variable(name)).get(name);
    }
    // Parse a string into a Formula.
    // (No error handling: assumes the syntax is valid)
    static parse(str) {
        const iter = str[Symbol.iterator]();

        function recur(end) {
            let formula;
            const connectives = [];
            for (const ch of iter) {
                if (ch === end) break;
                if ("∧v¬⇒⇔".includes(ch)) {
                    connectives.push(ch);
                } else {
                    let arg = ch == "(" ? recur(")")
                        : Formula.getVariable(ch);
                    while (connectives.length) {
                        const oper = connectives.pop();
                        arg = oper == "¬" ? arg.not()
                            : oper == "∧" ? formula.and(arg)
                                : oper == "v" ? formula.or(arg)
                                    : oper == "⇒" ? formula.implies(arg)
                                        : formula.equiv(arg);
                    }
                    formula = arg;
                }
            }
            return formula;
        }
        return recur();
    }

    // Subclasses: private. 
    // There is no need to create instances explicitly
    //    from outside the class.

    static #True = class extends Formula {
        evaluate() {
            return true;
        }
        toString() {
            return "⊤";
        }
        isCnf() {
            return true;
        }
        cnf() {
            return this;
        }
        usedVariables() {
            return [];
        }
    };

    static #False = class extends Formula {
        evaluate() {
            return false;
        }
        toString() {
            return "⊥";
        }
        isCnf() {
            return true;
        }
        cnf() {
            return this;
        }
        usedVariables() {
            return [];
        }
    };

    static #Variable = class extends Formula {
        #name;
        constructor(name) {
            super();
            this.#name = name;
        }
        evaluate(trueVariables) {
            return trueVariables.has(this);
        }
        toString() {
            return this.#name;
        }
        dump(indent="") {
            return indent + this.constructor.name + " " + this;
        }
        isCnf(level=0) {
            return level >= 2;
        }
        cnf() {
            return new Formula.#Conjunction(new Formula.#Disjunction(this));
        }

        // simplify() {
        //     return this; // Переменная не требует упрощения
        // }
        usedVariables() {
            return [this];
        }
    }

    static #Negation = class extends Formula {
        static symbol = "¬";
        evaluate(trueVariables) {
            return !this.#evalArgs(trueVariables)[0];
        }
        toString() {
            return this.constructor.symbol + (this.#args[0].#args.length > 1 ? `(${this.#args[0]})` : this.#args[0]);
        }
        isCnf(level=0) {
            return level == 2 && this.#args[0].isCnf(3);
        }
        cnf() {
            // If this is a negation of a variable, do as if it is a variable
            return this.isCnf(2) ? this.#args[0].cnf.call(this)
                // Else, sift down the NOT connective
                : this.#args[0].negatedCnf();
        }
        negatedCnf() {
            return this.#args[0].cnf();
        }
    }

    static #Disjunction = class extends Formula {
        static symbol = "∨";
        evaluate(trueVariables) {
            return this.#evalArgs(trueVariables).some(Boolean);
        }
        isCnf(level=0) {
            return level === 1 && this.#args.every(leaf => leaf.isCnf(2));
        }
        // cnf() {
        //     function* cartesian(firstCnf, ...otherCnfs) {
        //         if (!firstCnf) {
        //             yield [];
        //             return;
        //         }
        //         for (const disj of firstCnf.#args) {
        //             for (const combinations of cartesian(...otherCnfs)) {
        //                 yield [...disj.#args, ...combinations];
        //             }
        //         }
        //     }
        //
        //     return new Formula.#Conjunction(...Array.from(
        //         cartesian(...this.#cnfArgs()),
        //         leaves => new Formula.#Disjunction(...leaves)
        //     ));
        // }
        cnf() {
            // Удаление констант: A ∨ ⊥ эквивалентно A, A ∨ ⊤ эквивалентно ⊤
            const argsWithoutFalse = this.#args.filter(arg => !(arg instanceof Formula.#False));
            if (argsWithoutFalse.some(arg => arg instanceof Formula.#True)) {
                return Formula.trueConstant();
            }

            // Возвращаем обратно логику, если нет констант
            if (argsWithoutFalse.length === 0 || argsWithoutFalse.length !== this.#args.length) {
                return new Formula.#Conjunction(...argsWithoutFalse.map(arg => arg.cnf()));
            }

            // Старая логика CNF с учетом картезианского произведения
            function* cartesian(firstCnf, ...otherCnfs) {
                if (!firstCnf) {
                    yield [];
                    return;
                }
                for (const disj of firstCnf.#args) {
                    for (const combinations of cartesian(...otherCnfs)) {
                        yield [...disj.#args, ...combinations];
                    }
                }
            }

            return new Formula.#Conjunction(...Array.from(
                cartesian(...this.#cnfArgs()),
                leaves => new Formula.#Disjunction(...leaves)
            ));
        }
        negatedCnf() {
            return new Formula.#Conjunction(...this.#negatedArgs()).cnf();
        }

    }

    static #Conjunction = class extends Formula {
        static symbol = "∧";
        evaluate(trueVariables) {
            return this.#evalArgs(trueVariables).every(Boolean);
        }
        isCnf(level=0) {
            return level === 0 && this.#args.every(disj => disj.isCnf(1));
        }
        // cnf() {
        //     return this.isCnf(0) ? this // already in CNF format
        //         : new Formula.#Conjunction(...this.#cnfArgs().flatMap(conj => conj.#args));
        // }
        cnf() {
            // Удаление констант: A ∧ ⊤ эквивалентно A, A ∧ ⊥ эквивалентно ⊥
            const argsWithoutTrue = this.#args.filter(arg => !(arg instanceof Formula.#True));

            // Если в конъюнкции есть ⊥, вся конъюнкция эквивалентна ⊥
            if (argsWithoutTrue.some(arg => arg instanceof Formula.#False)) {
                return Formula.falseConstant();
            }

            // Если после удаления констант не осталось аргументов, возвращаем ⊤
            if (argsWithoutTrue.length === 0) {
                return Formula.trueConstant();
            }

            // Возвращаем старую логику CNF, если константы были удалены, иначе применяем CNF к оставшимся аргументам
            return argsWithoutTrue.length === this.#args.length ?
                this.isCnf(0) ? this : new Formula.#Conjunction(...this.#cnfArgs().flatMap(conj => conj.#args)) :
                new Formula.#Conjunction(...argsWithoutTrue.map(arg => arg.cnf()));
        }
        negatedCnf() {
            return new Formula.#Disjunction(...this.#negatedArgs()).cnf();
        }
    }

    static #Conditional = class extends Formula {
        static symbol = "⇒";
        evaluate(trueVariables) {
            return this.#evalArgs(trueVariables).reduce((a, b) => a <= b);
        }
        cnf() {
            return this.#args[0].not().or(this.#args[1]).cnf();
        }
        negatedCnf() {
            return this.#args[0].and(this.#args[1].not()).cnf();
        }
    }

    static #Equivalence = class extends Formula {
        static symbol = "⇔";
        evaluate(trueVariables) {
            const [a, b] = this.#evalArgs(trueVariables);
            return a === b;
        }
        cnf() {
            return this.#args[0].not().or(this.#args[1]).and(this.#args[1].not().or(this.#args[0])).cnf();
        }
        negatedCnf() {
            return this.#args[0].and(this.#args[1].not()).or(this.#args[0].not().and(this.#args[1])).cnf();
        }
    }
    static extractClauses(formula) {
        // Эта функция предполагает, что формула уже в CNF.
        // Клаузы в CNF — это дизъюнкции, которые являются аргументами конъюнкции.

        // Проверяем, является ли формула конъюнкцией.
        if (formula instanceof Formula.#Conjunction) {
            // Извлекаем клаузы из каждого аргумента конъюнкции.
            return formula.#args.map(disjunction => {
                // Проверяем, является ли аргумент дизъюнкцией.
                if (disjunction instanceof Formula.#Disjunction) {
                    // Возвращаем литералы дизъюнкции как клаузу.
                    return disjunction.#args.map(literal => {
                        // Здесь может потребоваться дополнительная логика,
                        // если вы хотите представить литералы в каком-то конкретном формате.
                        return literal.toString();
                    });
                } else {
                    // Если аргумент не является дизъюнкцией, это одиночный литерал.
                    return [disjunction.toString()];
                }
            });
        } else if (formula instanceof Formula.#Disjunction) {
            // Если формула состоит из одной дизъюнкции, возвращаем её как единственную клаузу.
            return [formula.#args.map(literal => literal.toString())];
        } else {
            // Если формула не конъюнкция и не дизъюнкция, это одиночный литерал.
            return [[formula.toString()]];
        }
    }

    static simplifyCnfFormula(cnfFormula) {
        // Извлекаем клаузы из CNF формулы
        const clauses = Formula.extractClauses(cnfFormula);

        console.log("before simplification : "   + clauses)

        // Удаляем клаузы-тавтологии и дубликаты литералов внутри клауз
        const filteredClauses = clauses
            .map(clause => [...new Set(clause)]) // Удаление дубликатов в клаузах
            .filter(clause => !clause.some(literal =>
                clause.includes(Formula.getOppositeLiteral(literal)))) // Удаление тавтологий

        if(filteredClauses.length === 0) {
            return '⊤';
        }


        // Построение новой CNF формулы из упрощенных клауз без лишних вложенностей
        return new Formula.#Conjunction(...filteredClauses.map(clause =>
            new Formula.#Disjunction(...clause.map(literal =>
                Formula.getVariable(literal)
            ))
        ));
    }



    // Дополнительный метод для получения противоположного литерала
    static getOppositeLiteral(literal) {
        return literal.startsWith('¬') ? literal.slice(1) : `¬${literal}`;
    }


    static extractClausesFromCNFArray(cnfArray) {
        let clauses = [];

        // Проходим по всем формулам в массиве
        for (const formula of cnfArray) {
            // Обрабатываем каждую формулу, как в оригинальной функции extractClauses
            if (formula instanceof Formula.#Conjunction) {
                const formulaClauses = formula.#args.map(disjunction => {
                    if (disjunction instanceof Formula.#Disjunction) {
                        return disjunction.#args.map(literal => literal.toString());
                    } else {
                        return [disjunction.toString()];
                    }
                });
                clauses.push(...formulaClauses);
            } else if (formula instanceof Formula.#Disjunction) {
                clauses.push(formula.#args.map(literal => literal.toString()));
            } else {
                clauses.push([formula.toString()]);
            }
        }

        return clauses;
    }

}

// Пример использования
// Examples
//
// // Create variables
// const P = Formula.getVariable("P");
// const Q = Formula.getVariable("Q");
// const R = Formula.getVariable("R");
// const S = Formula.getVariable("S");
// const T = Formula.getVariable("T");

// Build a formula using the variables
//      (P^Q^~R)v(~S^T)
// const formula = P.equiv(Q).equiv(Q.equiv(P)).not();
//
// // ...or parse a string (This will create variables where needed)
// const formula2 = Formula.parse("(P^Q^~R)v(~S^T)");
// const formula1 = Formula.parse("(AvB)^(AvB)");
//
// console.log("Formula: " + formula);
//
// // Check whether the formula has a CNF structure
// console.log("Is it CNF: " + formula.isCnf());
//
// // Create a CNF equivalent for a formula
// const cnfFormula = formula.cnf();
// const simplifiedFormula = Formula.simplifyCNF("(Av~A)");
// console.log("In CNF: " + simplifiedFormula);
//
// const cnfExpression = "(¬P∨Q∨P∨¬P)∧(¬P∨Q∨P∨Q)∧(¬P∨Q∨¬Q∨¬P)∧(¬P∨Q∨¬Q∨Q)∧(¬P∨Q∨¬Q∨P)∧(¬P∨Q∨¬P∨Q)∧(¬Q∨P∨P∨¬P)∧(¬Q∨P∨P∨Q)∧(¬Q∨P∨¬Q∨¬P)∧(¬Q∨P∨¬Q∨Q)∧(¬Q∨P∨¬Q∨P)∧(¬Q∨P∨¬P∨Q)∧(Q∨¬Q∨P∨¬P)∧(Q∨¬Q∨P∨Q)∧(Q∨¬Q∨¬Q∨¬P)∧(Q∨¬Q∨¬Q∨Q)∧(Q∨¬Q∨¬Q∨P)∧(Q∨¬Q∨¬P∨Q)∧(Q∨P∨P∨¬P)∧(Q∨P∨P∨Q)∧(Q∨P∨¬Q∨¬P)∧(Q∨P∨¬Q∨Q)∧(Q∨P∨¬Q∨P)∧(Q∨P∨¬P∨Q)∧(¬P∨¬Q∨P∨¬P)∧(¬P∨¬Q∨P∨Q)∧(¬P∨¬Q∨¬Q∨¬P)∧(¬P∨¬Q∨¬Q∨Q)∧(¬P∨¬Q∨¬Q∨P)∧(¬P∨¬Q∨¬P∨Q)∧(¬P∨P∨P∨¬P)∧(¬P∨P∨P∨Q)∧(¬P∨P∨¬Q∨¬P)∧(¬P∨P∨¬Q∨Q)∧(¬P∨P∨¬Q∨P)∧(¬P∨P∨¬P∨Q)";
// const simplifiedCNF = Formula.simplifyCNF(cnfExpression);
//
// console.log(simplifiedCNF);

// // Verify that they are equivalent
// console.log("Is equivalent? ", formula.equivalent(cnfFormula));
//
// // Evaluate the formula providing it the set of variables that are true
// console.log("When only P and T are true, this evaluates to: ", formula.evaluate(new Set([P,T])));

