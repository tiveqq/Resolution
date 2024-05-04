import {clearTree, replaceGreekSymbolsWithLatex} from "./proof-tree";
import {steps, applyResolution, isVisibility} from "./index"


let whichSelectToPaste = 1;

const checkIfButtonNeeded = document.getElementById('c2');
const buttonForApplyingResolutionRule = document.getElementById("applyResolutionButton");
let ifButtonNeeded = false;

document.addEventListener('DOMContentLoaded', function() {

    ifButtonNeeded = checkIfButtonNeeded.checked;

    checkIfButtonNeeded.addEventListener('change', function() {
        ifButtonNeeded = checkIfButtonNeeded.checked;
        buttonForApplyingResolutionRule.disabled = ifButtonNeeded;
    });
});

export function setWhichSelectToPaste(value) {
    whichSelectToPaste = value;
}

export function initControlButtons(editor) {
    let isResizing = false;
    const resizer = document.getElementById('divider');

    resizer.addEventListener('mousedown', function (e) {
        isResizing = true;
        let startX = e.clientX;
        let startWidthFirstHalf = document.getElementById('first-half').offsetWidth;

        function handleMouseMove(e) {
            if (!isResizing) {
                return;
            }

            const container = document.getElementById('main');
            const firstHalf = document.getElementById('first-half');
            const secondHalf = document.getElementById('second-half');

            const deltaX = e.clientX - startX;
            let newWidthFirstHalf = startWidthFirstHalf + deltaX;
            let newWidthFirstHalfPercent = (newWidthFirstHalf / container.offsetWidth) * 100;
            let newWidthSecondHalfPercent = 100 - newWidthFirstHalfPercent;

            if (newWidthFirstHalfPercent < 33) {
                newWidthFirstHalfPercent = 33;
                newWidthSecondHalfPercent = 100 - newWidthFirstHalfPercent;
            } else if (newWidthSecondHalfPercent < 29) {
                newWidthSecondHalfPercent = 29;
                newWidthFirstHalfPercent = 100 - newWidthSecondHalfPercent;
            }

            if (newWidthFirstHalfPercent >= 33 && newWidthSecondHalfPercent >= 29) {
                firstHalf.style.width = `${newWidthFirstHalfPercent}%`;
                secondHalf.style.width = `${newWidthSecondHalfPercent}%`;
                resizer.style.left = `${(newWidthFirstHalfPercent / 100) * container.offsetWidth}px`;
            }

            editor.layout();
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
    });


    const verticalResizer = document.getElementById('vertical-resizer');
    let isVerticalResizing = false;

    verticalResizer.addEventListener('mousedown', function (e) {
        isVerticalResizing = true;
        let startY = e.clientY;
        let startHeight = document.getElementById('monaco-editor').offsetHeight;

        function handleVerticalMouseMove(e) {
            if (!isVerticalResizing) {
                return;
            }

            const deltaY = e.clientY - startY;
            let newHeight = startHeight + deltaY;

            if (newHeight >= 0 && newHeight <= window.innerHeight) {
                document.getElementById('monaco-editor').style.height = `${newHeight}px`;
            }

            editor.layout();
        }

        document.addEventListener('mousemove', handleVerticalMouseMove);
        document.addEventListener('mouseup', () => {
            isVerticalResizing = false;
            document.removeEventListener('mousemove', handleVerticalMouseMove);
        });
    });

    const fontSizeSelector = document.getElementById('fontSizeSelector');

    fontSizeSelector.addEventListener('change', function () {
        editor.updateOptions({fontSize: parseInt(this.value)});
    });

    const pasteExampleSelector = document.getElementById('pasteExampleSelector');

    const examples = {
        example1: "p ∨ ¬p",
        example2: "(a⇒b)∧a⇒b",
        example3: "(a⇔b)⇔(a⇔b)",
        example4: "a, b ⊢ b",
        example5: "¬p⇒q\n¬q⇒r\n¬(p∧r)\n---------------\nq",
        example6: "φ⇒ψ\n" +
            "φ\n" +
            "---------------\n" +
            "ψ"
    };

    pasteExampleSelector.addEventListener('change', function () {
        const key = this.value;
        const codeToInsert = examples[key];

        if (codeToInsert) {
            editor.setValue(codeToInsert);
        }
    });
}
export function createResolutionStep(step, stepNumber) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'resolution-step';
    stepDiv.style.alignItems = 'center';

    const clausesLineContainer = document.createElement('div');
    clausesLineContainer.className = 'clauses-line-container';

    step.resolved.forEach(clause => {
        const clauseDiv = document.createElement('div');
        clauseDiv.className = 'clause';
        const clauseText = `\\Large{${Array.isArray(clause) ? clause.join(' \\vee ') : clause}}`;
        clauseDiv.innerHTML = `$$${clauseText}$$`;
        clausesLineContainer.appendChild(clauseDiv);
    });


    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';
    clausesLineContainer.appendChild(lineDiv);

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    if (Array.isArray(step.result)) {
        resultDiv.innerHTML = step.result.length > 0 ? `$$\\Large{${step.result.join(' \\vee ')}}$$` : '$$\\bot$$';
    } else {
        resultDiv.innerHTML = step.result === "[]" ? '$$\\bot$$' : `$$\\Large{${step.result}}$$`;
    }
    clausesLineContainer.appendChild(resultDiv);
    stepDiv.appendChild(clausesLineContainer);

    MathJax.typesetPromise([stepDiv]);

    return stepDiv;
}

export function returnDivsWithExplanation() {
    const CNFMessage = document.getElementById('cnf-formula');
    const clausesMessage = document.getElementById('clauses');
    const negationFormula = document.getElementById('negation-formula');
    const resolutionContainer = document.getElementById("resolution-container");
    const resolutionResultElement = document.getElementById('resolution-result');
    const stepByStepResolution = document.getElementById('stepByStepResolution');
    const clause1Select = document.getElementById('clause1');
    const clause2Select = document.getElementById('clause2');
    const historyElement = document.getElementById('history');
    const negatedFormula = document.getElementById('negated-formula');
    const cnfResult = document.getElementById('cnf-result');
    const clausesResult = document.getElementById('clauses-result');
    const descFormula = document.getElementById('description-formula');
    const descCNF = document.getElementById('description-cnf');
    const descClauses = document.getElementById('description-clauses');
    const resultInterpretation = document.getElementById('result-interpretation')
    const stepsExplanation = document.getElementById('steps-explanation');
    const dotLines = document.getElementsByClassName('dotted-line-background');
    const buttonLaTeXDynamic = document.getElementById("latex-tree-generate-dynamic");
    const buttonSVGDynamic = document.getElementById("download-btn-dynamic-svg");
    const visualizationResult = document.getElementById('visualization-result');
    return {
        CNFMessage,
        clausesMessage,
        negationFormula,
        resolutionContainer,
        resolutionResultElement,
        stepByStepResolution,
        clause1Select,
        clause2Select,
        historyElement,
        negatedFormula,
        cnfResult,
        clausesResult,
        descFormula,
        descCNF,
        descClauses,
        resultInterpretation,
        stepsExplanation,
        dotLines, buttonLaTeXDynamic, buttonSVGDynamic, visualizationResult
    };
}

export function divsOfExplanation() {
    const {
        CNFMessage,
        clausesMessage,
        negationFormula,
        resolutionContainer,
        resolutionResultElement,
        stepByStepResolution,
        clause1Select,
        clause2Select,
        historyElement,
        negatedFormula,
        cnfResult,
        clausesResult,
        descFormula,
        descCNF,
        descClauses,
        resultInterpretation,
        stepsExplanation,
        dotLines,
        buttonLaTeXDynamic,
        buttonSVGDynamic,
        visualizationResult
    } = returnDivsWithExplanation();

    historyElement.innerHTML = '';
    clearTree("#tree-container");
    clearTree("#dynamic-tree-container");
    clearTableResolutionInterpretation();

    CNFMessage.innerHTML = '';
    clausesMessage.innerHTML = '';
    clausesResult.style.visibility = 'hidden';
    negationFormula.style.visibility = 'hidden';
    cnfResult.style.visibility = 'hidden'
    resolutionContainer.innerHTML = '';
    resolutionResultElement.innerHTML = '';
    negatedFormula.innerHTML = '';
    descFormula.innerHTML = '';
    descClauses.innerHTML = '';
    if(!isVisibility) {
        dotLines[0].style.visibility = 'hidden';
        dotLines[1].style.visibility = 'hidden';
    }

    visualizationResult.innerHTML = '';

    descCNF.innerHTML = '';
    resultInterpretation.style.visibility = 'hidden';
    stepsExplanation.style.visibility = 'hidden';

    stepByStepResolution.style.display = 'none';
    clause1Select.innerHTML = '';
    clause2Select.innerHTML = '';


    //buttonLaTeXDynamic.style.display = 'none';
    // buttonSVGDynamic.style.display = 'none';

    return {CNFMessage, clausesMessage, negationFormula, resolutionContainer, resolutionResultElement,
        stepByStepResolution, clause1Select, clause2Select, historyElement, negatedFormula, cnfResult,
        clausesResult, descClauses, descFormula, descCNF, resultInterpretation, stepsExplanation, dotLines,
        buttonLaTeXDynamic, buttonSVGDynamic};
}

export function clearTableResolutionInterpretation() {
    const tableContainer = document.getElementById("table-resolution-interpretation");
    tableContainer.innerHTML = "";
}

export function convertInteractiveActualClausesToLatex(clauses) {
    if (clauses.length === 0) {
        return "\\(\\bot\\)";
    }
    return "{\\(" + clauses.join(', ') + "\\)}";
}

export function convertInteractiveSelectClausesToLatex(clauses) {
    if (clauses.length === 0) {
        return "⊥";
    }
    return "{" + clauses.join(', ') + "}";
}

export function convertActualClausesToLatex(clauses) {
    return clauses.map((clause, index) => {
        const clauseArray = Array.isArray(clause) ? clause : [clause];
        if (clauseArray.length === 0) {
            return "<span class='clauseActual'>\\(\\color{green}{\\bot}\\)</span>";
        } else {
            const isLastClause = index === clauses.length - 1;
            const clauseText = clauseArray.map(literal => literal).join(', ');
            if (isLastClause) {
                return `<span class='clauseActual'>{\\(\\color{green}{${clauseText}}\\)}</span>`;
            } else {
                return `<span class='clauseActual'>{\\(${clauseText}\\)}</span>`;
            }
        }
    }).join(', ');
}

export function updateClauseSelections(clauses) {
    const select1 = document.getElementById('clause1');
    const select2 = document.getElementById('clause2');

    const value1 = select1.value;
    const value2 = select2.value;

    select1.innerHTML = '';
    select2.innerHTML = '';


    clauses.forEach((clause, index) => {
        let option1 = new Option(convertInteractiveActualClausesToLatex(clause), index);
        let option2 = new Option(convertInteractiveActualClausesToLatex(clause), index);
        select1.add(option1);
        select2.add(option2);
    });

    select1.selectedIndex = value1;
    select2.selectedIndex = value2;

    MathJax.typesetPromise();
}

/**
 * Updates the actual list of clauses (part of interactive proving)
 * @param clauses
 */
export function updateCurrentClausesDisplay(clauses) {
    const currentClausesElement = document.getElementById('currentClauses');
    currentClausesElement.innerHTML = '';

    clauses.forEach(clause => {
        const clauseCard = document.createElement('div');
        clauseCard.className = 'clause-card';
        clauseCard.textContent = convertInteractiveSelectClausesToLatex(clause);

        clauseCard.addEventListener('click', () => {
            let select1;
            if(whichSelectToPaste === 1) {
                select1 = document.getElementById('clause1');
                select1.focus();

            } else if(whichSelectToPaste === 2) {
                select1 = document.getElementById('clause2');
                select1.focus();

            }
            let filteredClause = convertInteractiveActualClausesToLatex(clause);
            filteredClause = filteredClause.replace(/[()\s\\]/g, '');


            for (let i = 0; i < select1.options.length; i++) {
                if (select1.options[i].value === clause) {
                    select1.slectedIndex = i;
                    break;
                }
            }

            let optionFound = false;
            for (let i = 0; i < select1.options.length; i++) {
                if (select1.options[i].text === filteredClause) {
                    select1.selectedIndex = i;
                    optionFound = true;
                    break;
                }
            }

            if(whichSelectToPaste === 1) {
                whichSelectToPaste++;
            } else if(whichSelectToPaste === 2) {
                whichSelectToPaste--;
                if(ifButtonNeeded) {
                    applyResolution();
                }

            }

            if (!optionFound) {
                let newOption = new Option(filteredClause, clause.index);
                select1.add(newOption);
                select1.selectedIndex = select1.options.length - 1;
            }
        });

        currentClausesElement.appendChild(clauseCard);
    });
    // MathJax.typesetPromise();
}

export function convertFormulasToLatex(expression) {

    return expression
        .replace(/⇒/g, '\\Rightarrow ')
        .replace(/∧/g, '\\wedge ')
        .replace(/∨/g, '\\vee ')
        .replace(/¬/g, '\\neg ')
        .replace(/⊢/g, '\\vdash ');
}

export function convertClausesToLatex(clauses) {
    return clauses.map(clause =>
            "\\left\\{" + clause.map(literal => {
                return literal;
            }).join(', ') + "\\right\\}"
    ).join(', ');
}

function formatClause(clauseArray) {
    if (clauseArray.length === 0) {
        return "⊥";
    } else {
        return `{${clauseArray.join(', ')}}`;
    }
}

export function generateLatexTable(table) {
    let latexCode = "\\begin{tabular}{|c|c|c|}\n";

    latexCode += "\\hline\n";


    const tableBody = table.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const stepNumber = cells[0].textContent;
        let clause = cells[1].textContent;
        const source = cells[2].textContent;

        clause = replaceGreekSymbolsWithLatex(clause);
        clause = clause.replace(/\{([^}]+)}/g, (match, p1) =>  `{$\\{${p1.replace(/¬/g, "\\neg ")}\\}$}`);

        latexCode += `\t${stepNumber} & ${clause} & ${source} \\\\\n`;

        latexCode += "\\hline\n";
    });

    latexCode += "\\end{tabular}\n";
    return latexCode;
}


export function updateResolutionTable(initialClauses) {
    const tableContainer = document.getElementById("table-resolution-interpretation");
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("resolution-table");
    table.id = 'resolution-table-interpretation'
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);

    function addClickListener(row, clauseArray) {
        row.addEventListener('click', () => {
            let select1;
            if (whichSelectToPaste === 1) {
                select1 = document.getElementById('clause1');
                select1.focus();
            } else if (whichSelectToPaste === 2) {
                select1 = document.getElementById('clause2');
                select1.focus();
            }

            let filteredClause = convertInteractiveActualClausesToLatex(clauseArray);
            filteredClause = filteredClause.replace(/[()\s\\]/g, '');

            for (let i = 0; i < select1.options.length; i++) {
                if (select1.options[i].value === clauseArray) {
                    select1.selectedIndex = i;
                    break;
                }
            }

            let optionFound = false;
            for (let i = 0; i < select1.options.length; i++) {
                if (select1.options[i].text === filteredClause) {
                    select1.selectedIndex = i;
                    optionFound = true;
                    break;
                }
            }

            if (whichSelectToPaste === 1) {
                whichSelectToPaste++;
            } else if (whichSelectToPaste === 2) {
                whichSelectToPaste--;
                if (ifButtonNeeded) {
                    applyResolution();
                }
            }
        });
    }


    initialClauses.forEach((clauseArray, index) => {
        const row = document.createElement("tr");
        addCell(row, index + 1);
        addCell(row, `{${clauseArray.join(', ')}}`);
        addCell(row, "-");
        tbody.appendChild(row);
        addClickListener(row, clauseArray);

    });
    steps.forEach((step, index) => {
        const row = document.createElement("tr");
        const stepNumber = initialClauses.length + index + 1;

        addCell(row, stepNumber);
        addCell(row, formatClause(step.result));

        const combinedClauses = initialClauses.concat(steps.slice(0, index).map(s => s.result));

        const source1 = findClauseIndex(step.resolved[0], combinedClauses);
        const source2 = findClauseIndex(step.resolved[1], combinedClauses);
        const source = source1 !== -1 && source2 !== -1 ? `${source1} a ${source2}` : "-";
        addCell(row, source);

        tbody.appendChild(row);

        addClickListener(row, step.result);

    });

    tableContainer.appendChild(table);
}

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

function findClauseIndex(clause, clausesArray) {
    const clauseStr = clause.join(', ');
    for (let i = 0; i < clausesArray.length; i++) {
        if (`${clausesArray[i].join(', ')}` === clauseStr) {
            return i + 1;
        }
    }
    return -1;
}
