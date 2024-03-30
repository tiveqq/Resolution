function isComplementary(literal1, literal2) {
    return literal1 === '¬' + literal2 || '¬' + literal1 === literal2;
}

function findComplementary(literals, clause) {
    for (let literal of literals) {
        for (let target of clause) {
            if (isComplementary(literal, target)) {
                return [literal, target];
            }
        }
    }
    return null;
}

function resolve(clause1, clause2) {
    const complementaryPair = findComplementary(clause1, clause2);
    if (complementaryPair) {
        const [lit1, lit2] = complementaryPair;
        let newClause = clause1.concat(clause2).filter(lit => lit !== lit1 && lit !== lit2);

        if (!newClause.some(literal => newClause.includes('¬' + literal) || newClause.includes(literal.charAt(0) === '¬' ? literal.substring(1) : '¬' + literal))) {
            return [...new Set(newClause)];
        }
    }
    return null;
}

function containsClause(clauses, clauseToCheck) {
    return clauses.some(clause => clause.sort().join(',') === clauseToCheck.sort().join(','));
}

function resolutionCommon(clauses) {
    let newClauses = [...clauses];
    let finalSteps = [];
    let isProved = false;

    while (true) {
        let tempSteps = [];
        let foundResolution = false;

        for (let i = 0; i < newClauses.length; i++) {
            for (let j = i + 1; j < newClauses.length; j++) {
                const resolvedClause = resolve(newClauses[i], newClauses[j]);

                if (resolvedClause && !containsClause(newClauses, resolvedClause)) {
                    newClauses.push(resolvedClause);
                    tempSteps.push({ resolved: [newClauses[i], newClauses[j]], result: resolvedClause, clauses: [...newClauses] });
                    foundResolution = true;

                    if (resolvedClause.length === 0) {
                        finalSteps = finalSteps.concat(tempSteps);
                        isProved = true;
                        break;
                    }
                }
            }
            if (isProved) break;
        }

        if (!foundResolution || isProved) {
            break;
        }

        finalSteps = finalSteps.concat(tempSteps);
    }

    return { steps: finalSteps, isProved };
}

function resolutionLinear(clauses) {
    let newClauses = [...clauses];
    if (newClauses.length === 0) {
        return { steps: [], isProved: false };
    }

    let finalSteps = [];
    let isProved = false;
    let initialResolved = false;

    for (let i = 0; i < newClauses.length && !initialResolved; i++) {
        for (let j = i + 1; j < newClauses.length && !initialResolved; j++) {
            let resolvedClause = resolve(newClauses[i], newClauses[j]);
            if (resolvedClause) {
                initialResolved = true;
                finalSteps.push({
                    resolved: [newClauses[i], newClauses[j]],
                    result: resolvedClause,
                    clauses: [...newClauses, resolvedClause]
                });

                if (resolvedClause.length === 0) {
                    isProved = true;
                } else {
                    newClauses.push(resolvedClause);
                }
            }
        }
    }

    if (!initialResolved || isProved) {
        return { steps: finalSteps, isProved };
    }

    let currentClause = newClauses[newClauses.length - 1];
    while (newClauses.length > 0 && !isProved) {
        let clauseAdded = false;
        for (let i = 0; i < newClauses.length; i++) {
            if (currentClause !== newClauses[i]) {
                let resolvedClause = resolve(currentClause, newClauses[i]);
                if (resolvedClause) {
                    finalSteps.push({
                        resolved: [currentClause, newClauses[i]],
                        result: resolvedClause,
                        clauses: [...newClauses, resolvedClause]
                    });

                    if (resolvedClause.length === 0) {
                        isProved = true;
                        break;
                    } else {
                        currentClause = resolvedClause;
                        newClauses.push(resolvedClause);
                        clauseAdded = true;
                    }
                }
            }
        }
        if (!clauseAdded) {
            break;
        }
    }

    return { steps: finalSteps, isProved };
}


function resolutionUnit(clauses) {
    let newClauses = [...clauses];
    let finalSteps = [];
    let isProved = false;

    const isUnitClause = clause => clause.length === 1;

    for (let i = 0; i < newClauses.length && !isProved; i++) {
        for (let j = 0; j < newClauses.length && !isProved; j++) {
            if (i !== j && (isUnitClause(newClauses[i]) || isUnitClause(newClauses[j]))) {
                const resolvedClause = resolve(newClauses[i], newClauses[j]);

                if (resolvedClause && !containsClause(newClauses, resolvedClause)) {
                    newClauses.push(resolvedClause);
                    finalSteps.push({
                        resolved: [newClauses[i], newClauses[j]],
                        result: resolvedClause,
                        clauses: [...newClauses]
                    });

                    if (resolvedClause.length === 0) {
                        isProved = true;
                    }
                }
            }
        }
    }

    return { steps: finalSteps, isProved };
}
