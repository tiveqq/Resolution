export default class Formula {
    #args;

    constructor(...args) {
        this.#args = args;
    }
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

    evaluate(trueVariables) {
    }
    toString() {
        return this.#stringifyArgs().join(this.constructor.symbol);
    }
    isCnf(level=0) {
        return false;
    }
    cnf() {
        return this;
    }
    usedVariables() {
        return [...new Set(this.#args.flatMap(arg => arg.usedVariables()))];
    }

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
        return this.#args.length < 2 ? this.#args.map(String)
            : this.#args.map(arg => arg.#args.length > 1 ? "(" + arg + ")" : arg + "");
    }
    dump(indent="") {
        return [
            indent + this.constructor.name + " (",
            ...this.#args.map(arg => arg.dump(indent + "  ")),
            indent + ")"
        ].join("\n");
    }

    static #variables = new Map;
    static getVariable(name) {
        return this.#variables.get(name)
            ?? this.#variables.set(name, new this.#Variable(name)).get(name);
    }

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
            return this.isCnf(2) ? this.#args[0].cnf.call(this)
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
        cnf() {
            const argsWithoutFalse = this.#args.filter(arg => !(arg instanceof Formula.#False));
            if (argsWithoutFalse.some(arg => arg instanceof Formula.#True)) {
                return Formula.trueConstant();
            }

            if (argsWithoutFalse.length === 0 || argsWithoutFalse.length !== this.#args.length) {
                return new Formula.#Conjunction(...argsWithoutFalse.map(arg => arg.cnf()));
            }

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

        cnf() {
            const argsWithoutTrue = this.#args.filter(arg => !(arg instanceof Formula.#True));

            if (argsWithoutTrue.some(arg => arg instanceof Formula.#False)) {
                return Formula.falseConstant();
            }

            if (argsWithoutTrue.length === 0) {
                return Formula.trueConstant();
            }

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
        if (formula instanceof Formula.#Conjunction) {
            return formula.#args.map(disjunction => {
                if (disjunction instanceof Formula.#Disjunction) {
                    return disjunction.#args.map(literal => {

                        return literal.toString();
                    });
                } else {
                    return [disjunction.toString()];
                }
            });
        } else if (formula instanceof Formula.#Disjunction) {
            return [formula.#args.map(literal => literal.toString())];
        } else {
            return [[formula.toString()]];
        }
    }

    static simplifyCnfFormula(cnfFormula) {
        const clauses = Formula.extractClauses(cnfFormula);

        const filteredClauses = clauses
            .map(clause => [...new Set(clause)])
            .filter(clause => !clause.some(literal =>
                clause.includes(Formula.getOppositeLiteral(literal))))

        if(filteredClauses.length === 0) {
            return '⊤';
        }

        return new Formula.#Conjunction(...filteredClauses.map(clause =>
            new Formula.#Disjunction(...clause.map(literal =>
                Formula.getVariable(literal)
            ))
        ));
    }

    static getOppositeLiteral(literal) {
        return literal.startsWith('¬') ? literal.slice(1) : `¬${literal}`;
    }

    static extractClausesFromCNFArray(cnfArray) {
        let clauses = [];
        for (const formula of cnfArray) {
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

