const antlr4 = require('antlr4');
import PropositionalLogicLexer from "../antlr-generated/PropositionalLogicLexer";
import PropositionalLogicParser from "../antlr-generated/PropositionalLogicParser";
import PropositionalLogicVisitor from "../antlr-generated/PropositionalLogicVisitor";
import Formula from "./cnf-converter"
import * as monaco from 'monaco-editor';

const resolveButton = document.getElementById('resolveButton'); // button, which executes FORMULA scenario

let formula = null; // current value// of user's FORMULA input
let logicalConsequence = []; // // current value of user's LOGICAL CONSEQUENCE input
let clausesForEach = []; // current clauses in a moment of submitting the input formulas/conditions/conclusions
let stepNumber = 0; // current step number in interactive proving formulas mode
let undoStack = [];
let redoStack = [];
let steps = []; // current special structure of clausesForEach
let resolutionFound = false; // is resolution was found by the method
let usedPairs = new Set(); // used pairs of clauses by user's
const applyResolutionButton = document.getElementById('applyResolutionButton');
applyResolutionButton.addEventListener('click', applyResolution); // applies resolution rule on two clauses
const buttonDynamicSVG = document.getElementById('download-btn-dynamic'); // download SVG dynamic tree button
const strategiesSelect = document.getElementById('strategiesResolution');
let isChecked = false;
let isDIMACS = false;
let lastIsChecked;
let isWithoutStrategy = true;
let isLinearResolution = false;
let isUnitResolution = false;
let wasStrategyChanged = false;
let initialClauses = [];
let isAnySteps = false;

document.styleSheets[0].insertRule('.myRedStyle { color: red; font-weight: bold; }', 0);


// CSS styles for proof trees
const cssStyles = `
            .link {
                fill: none;
                stroke: #000;
                stroke-width: 1px;
            }
            
            .node circle {
                fill: #fff; 
                stroke: #000; 
                stroke-width: 1px; 
            }
            
            .node text {
                font: 12px sans-serif;
            }
            
            .node--internal circle {
                fill: #ffffff;
            }
            
            .node--leaf circle {
                fill: #fff;
            }
            `;

// Creating Monaco editor
const editorOptions = {
    value: '',
    language: 'propositional-logic-language',
    fontSize: 18,
    renderLineHighlight: 'line'
};
monaco.languages.register({ id: 'propositional-logic-language' });
let editor = monaco.editor.create(document.getElementById('monaco-editor'), editorOptions);

const model = editor.getModel();

const resizer = document.getElementById('divider');
let isResizing = false;

resizer.addEventListener('mousedown', function(e) {
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

verticalResizer.addEventListener('mousedown', function(e) {
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

window.addEventListener('resize', function() {
    if (window.innerWidth <= 1400) {
        document.getElementById('first-half').style.width = '';
        document.getElementById('second-half').style.width = '';
    }
    if (window.innerWidth > 1400) {
        const firstHalf = document.getElementById('first-half');
        const divider = document.getElementById('divider');

        divider.style.left = `${firstHalf.offsetWidth}px`;

        editor.layout();
    }
    editor.layout();
});


monaco.languages.registerCompletionItemProvider('propositional-logic-language', {
    triggerCharacters: ['\\'],
    provideCompletionItems: function(model, position) {
        const suggestions = [
            {
                label: '\\wedge',
                kind: monaco.languages.CompletionItemKind.Operator,
                insertText: '∧',
                range: getRange(position),
                detail: '∧',
            },
            {
                label: '\\vee',
                kind: monaco.languages.CompletionItemKind.Operator,
                insertText: '∨',
                range: getRange(position),
                detail: '∨',
            },
            {
                label: '\\neg',
                kind: monaco.languages.CompletionItemKind.Operator,
                insertText: '¬',
                range: getRange(position),
                detail: '¬',
            },
            {
                label: '\\Rightarrow',
                kind: monaco.languages.CompletionItemKind.Operator,
                insertText: '⇒',
                range: getRange(position),
                detail: '⇒',
            },
            {
                label: '\\Leftrightarrow',
                kind: monaco.languages.CompletionItemKind.Operator,
                insertText: '⇔',
                range: getRange(position),
                detail: '⇔',
            },
            {
                label: '\\alpha',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'α',
                range: getRange(position),
                detail: 'α',
            },
            {
                label: '\\beta',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'β',
                range: getRange(position),
                detail: 'β',
            },
            {
                label: '\\gamma',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'γ',
                range: getRange(position),
                detail: 'γ',
            },
            {
                label: '\\delta',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'δ',
                range: getRange(position),
                detail: 'δ',
            },
            {
                label: '\\epsilon',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ε',
                range: getRange(position),
                detail: 'ε',
            },
            {
                label: '\\zeta',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ζ',
                range: getRange(position),
                detail: 'ζ',
            },
            {
                label: '\\eta',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'η',
                range: getRange(position),
                detail: 'η',
            },
            {
                label: '\\theta',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'θ',
                range: getRange(position),
                detail: 'θ',
            },
            {
                label: '\\iota',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ι',
                range: getRange(position),
                detail: 'ι',
            },
            {
                label: '\\kappa',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'κ',
                range: getRange(position),
                detail: 'κ',
            },
            {
                label: '\\lambda',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'λ',
                range: getRange(position),
                detail: 'λ',
            },
            {
                label: '\\mu',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'μ',
                range: getRange(position),
                detail: 'μ',
            },
            {
                label: '\\xi',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ξ',
                range: getRange(position),
                detail: 'ξ',
            },
            {
                label: '\\omicron',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ο',
                range: getRange(position),
                detail: 'ο',
            },
            {
                label: '\\pi',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'π',
                range: getRange(position),
                detail: 'π',
            },
            {
                label: '\\rho',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ρ',
                range: getRange(position),
                detail: 'ρ',
            },
            {
                label: '\\sigma',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'σ',
                range: getRange(position),
                detail: 'σ',
            },
            {
                label: '\\tau',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'τ',
                range: getRange(position),
                detail: 'τ',
            },
            {
                label: '\\upsilon',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'υ',
                range: getRange(position),
                detail: 'υ',
            },
            {
                label: '\\phi',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'φ',
                range: getRange(position),
                detail: 'φ',
            },
            {
                label: '\\chi',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'χ',
                range: getRange(position),
                detail: 'χ',
            },
            {
                label: '\\psi',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ψ',
                range: getRange(position),
                detail: 'ψ',
            },
            {
                label: '\\omega',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: 'ω',
                range: getRange(position),
                detail: 'ω',
            },
            {
                label: '\\bot',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '⊥',
                range: getRange(position),
                detail: '⊥',
            },
            {
                label: '\\top',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '⊤',
                range: getRange(position),
                detail: '⊤',
            },
            {
                label: '\\line',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '---------------\n',
                range: getRange(position),
                detail: '\\\\\\',
            },
            {
                label: '\\vdash',
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: '⊢',
                range: getRange(position),
                detail: '⊢',
            }


        ];

        return { suggestions: suggestions };
    }
});


monaco.editor.defineTheme('myCustomTheme', {
    base: 'vs', 
    inherit: true,
    rules: [], 
    colors: {
        'editor.lineHighlightBackground': '#eef3fc', 
        'editor.lineHighlightBorder': '#a5d0ff'
    }
});

monaco.editor.setTheme('myCustomTheme');

const fontSizeSelector = document.getElementById('fontSizeSelector');

fontSizeSelector.addEventListener('change', function () {
    editor.updateOptions({ fontSize: parseInt(this.value) });
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
function getRange(position) {
    return {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column - 1,
        endColumn: position.column
    };
}

function checkSyntax(input, isFormula) {
    monaco.editor.setModelMarkers(editor.getModel(), 'propositional-logic-language', []);

    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = '';

    const resolveButton = document.getElementById('resolveButton');


    if (input.includes('⊢')) {
        const relevantLine = input.split('\n').find(line => line.includes('⊢'));

        if (relevantLine) {
            const [premises, conclusion] = relevantLine.split('⊢');
            const premisesLines = premises.split(',').map(s => s.trim()).filter(s => s !== '');
            const formattedInput = [...premisesLines, '---------------', conclusion.trim()].join('\n');
            const lines = formattedInput.split('\n');
            const results = [];
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '' || lines[i] === '---------------' || lines[i] === '///') continue;
                const result = parseAndVisit(lines[i].trim(), i);
                if (result !== null) {
                    results.push(result);
                }
            }
            return results;
        }
    } else if (isFormula) {
        return parseAndVisit(input, 0);
    } else {
        const lines = input.split('\n');
        const results = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '' || lines[i] === '---------------' || lines[i] === '///') continue;
            const result = parseAndVisit(lines[i].trim(), i);
            if (result !== null) {
                results.push(result);
            }
        }
        return results;
    }
}

function parseAndVisit(input, lineNumberOffset) {
    console.log(input)
    let hasErrors = false;

    const chars = new antlr4.InputStream(input);
    const lexer = new PropositionalLogicLexer(chars);
    lexer.removeErrorListeners();
    lexer.addErrorListener({
        syntaxError: function (recognizer, offendingSymbol, line, column, msg) {
            displayError(`line ${line + lineNumberOffset}:${column}: ${msg}`, line + lineNumberOffset, column, offendingSymbol);
            hasErrors = true;
        }
    });

    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new PropositionalLogicParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener({
        syntaxError: function (recognizer, offendingSymbol, line, column, msg) {
            displayError(`line ${line + lineNumberOffset}:${column}: ${msg}`, line + lineNumberOffset, column, offendingSymbol);
            hasErrors = true;
        }
    });

    const tree = parser.logic();
    resolveButton.disabled = hasErrors;

    if (hasErrors) {
        return false;
    }

    const visitor = new PropositionalLogicVisitor();
    return visitor.visit(tree);
}

document.getElementById('openFile').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            editor.setValue(contents);
            replaceInputSymbolsInMonaco(editor);
        };
        reader.readAsText(file);
    }
});


function displayError(message, line, column, offendingSymbol) {
    const startColumn = column;
    const endColumn = column + (offendingSymbol ? offendingSymbol.text.length : 1);

    const errorMarker = {
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: line,
        startColumn: startColumn,
        endLineNumber: line,
        endColumn: endColumn,
        message: message
    };

    monaco.editor.setModelMarkers(editor.getModel(), 'propositional-logic-language', [errorMarker]);

    resolveButton.disabled = true;
}


function buildTreeDataCommon(steps) {
    const lastStep = steps[steps.length - 1];
    const rootNode = {
        name: (Array.isArray(lastStep.result) && lastStep.result.length === 0) || lastStep.result === '[]' ? "□" : lastStep.result,
        children: []
    };
    
    lastStep.resolved.forEach(resolved => {
        rootNode.children.push({
            name: `{${resolved.join(', ')}}`,
            children: []
        });
    });

    function addChildrenToNode(node, stepIndex) {
        if (stepIndex < 0) return;

        const currentStep = steps.find(step => (Array.isArray(step.result) ? step.result.join(', ') : step.result) === node.name.replace(/[{}]/g, ''));

        if (currentStep) {
            currentStep.resolved.forEach(resolved => {
                const childNode = {
                    name: `{${resolved.join(', ')}}`,
                    children: []
                };
                node.children.push(childNode);
                addChildrenToNode(childNode, stepIndex - 1);
            });
        }
    }

    rootNode.children.forEach(childNode => {
        addChildrenToNode(childNode, steps.length - 2);
    });

    return rootNode;
}

function buildTreeDataLinear(steps) {
    const lastStep = steps[steps.length - 1];
    const rootNode = {
        name: (Array.isArray(lastStep.result) && lastStep.result.length === 0) || lastStep.result === '[]' ? "□" : `{${lastStep.result.join(', ')}}`,
        children: []
    };
    
    lastStep.resolved.forEach(resolved => {
        rootNode.children.push({
            name: `{${resolved.join(', ')}}`,
            children: []
        });
    });

    function addChildrenToNode(node, stepIndex) {
        if (stepIndex < 0) return;

        const currentStep = steps[stepIndex];
        if (currentStep && `{${currentStep.result.join(', ')}}` === node.name) {
            currentStep.resolved.forEach(resolved => {
                const childNode = {
                    name: `{${resolved.join(', ')}}`,
                    children: []
                };
                node.children.push(childNode);
                addChildrenToNode(childNode, stepIndex - 1);
            });
        }
    }

    rootNode.children.forEach(childNode => {
        addChildrenToNode(childNode, steps.length - 2);
    });

    return rootNode;
}


function downloadSVG(svgElement, fileName, styles) {
    const cloneSvgElement = svgElement.cloneNode(true);

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    cloneSvgElement.prepend(styleElement);

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(cloneSvgElement);

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function drawTree(data, treeContainer) {
    const width = 400;
    const height = 400;
    const margin = { top: 20, right: 0, bottom: 30, left: 0 };

    const svg = d3.select(treeContainer).append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform);
        }))
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const treemap = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .separation((a, b) => a.parent === b.parent ? 1 : 2);

    let root = d3.hierarchy(data, d => d.children);
    treemap(root);

    root.descendants().forEach(d => {
        d.y = height - d.y;
    });

    const drag = d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded);

    function dragStarted(event, d) {
        d3.select(this).raise().attr('stroke', 'black');
    }

    function dragging(event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        updateLinks();
    }

    function dragEnded(event, d) {
        d3.select(this).attr('stroke', null);
    }

    function updateLinks() {
        link.attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
    }

    const link = svg.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))

    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .call(drag);

    node.append('circle')
        .attr('r', 10);

    node.append('text')
        .attr('dy', '0.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('font-size', '15px')
        .text(d => d.data.name);
}

function clearTree(treeContainer) {
    const svgContainer = d3.select(treeContainer);
    svgContainer.selectAll('*').remove();
}

function createResolutionStep(step, stepNumber) {
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

buttonDynamicSVG.addEventListener('click', function() {
    const svgElement = document.querySelector('#dynamic-tree-container svg');

    if (svgElement) {
        downloadSVG(svgElement, 'myTree.svg', cssStyles);
    } else {
        displayMessage("Nebol vytvorený žiaden strom na stiahnutie.", 'error')
    }
});

function divsOfExplanation() {
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
    dotLines[0].style.visibility = 'hidden';
    dotLines[1].style.visibility = 'hidden';

    descCNF.innerHTML = '';
    resultInterpretation.style.visibility = 'hidden';
    stepsExplanation.style.visibility = 'hidden';

    stepByStepResolution.style.display = 'none';
    clause1Select.innerHTML = '';
    clause2Select.innerHTML = '';

    return {CNFMessage, clausesMessage, negationFormula, resolutionContainer, resolutionResultElement,
        stepByStepResolution, clause1Select, clause2Select, historyElement, negatedFormula, cnfResult,
        clausesResult, descClauses, descFormula, descCNF, resultInterpretation, stepsExplanation, dotLines};
}


function updateClauseSelections(clauses) {
    const select1 = document.getElementById('clause1');
    const select2 = document.getElementById('clause2');

    select1.innerHTML = '';
    select2.innerHTML = '';

    clauses.forEach((clause, index) => {
        let option1 = new Option(convertInteractiveActualClausesToLatex(clause), index);
        let option2 = new Option(convertInteractiveActualClausesToLatex(clause), index);
        select1.add(option1);
        select2.add(option2);
    });

    MathJax.typesetPromise();
}

/**
 * Updates the actual list of clauses (part of interactive proving)
 * @param clauses
 */
function updateCurrentClausesDisplay(clauses) {
    const currentClausesElement = document.getElementById('currentClauses');
    currentClausesElement.innerHTML = '';

    clauses.forEach(clause => {
        console.log("clauses" + clause)
        const clauseCard = document.createElement('div');
        clauseCard.className = 'clause-card';
        clauseCard.textContent = convertInteractiveActualClausesToLatex(clause);
        currentClausesElement.appendChild(clauseCard);
    });
    MathJax.typesetPromise();
}

/**
 * Applies resolution rule on the pair of clauses and interpret results, creates history,
 * dynamic proof tree and defines when formula is proved (part of interactive proving).
 */
function applyResolution() {
    if (resolutionFound) {
        displayMessage("Riešenie sa už našlo. Ďalšie použitie pravidla rezolúcie nie je možné.", 'warning');
        return;
    }


    updateResolutionTable(initialClauses);
    clausesForEach = clausesForEach.filter(clause => clause.length > 0);

    console.log("HORRAY", initialClauses)

    const clause1 = clausesForEach[document.getElementById('clause1').value];
    const clause2 = clausesForEach[document.getElementById('clause2').value];

    if (clause1 === clause2) {
        displayMessage("Vybrali ste tie isté klauzuly. Vyberte rôzne klauzuly.", 'error');
        return;
    }

    const sortedIndexes = [clause1, clause2].sort();
    const pairKey = `${sortedIndexes[0]}-${sortedIndexes[1]}`;
    if (usedPairs.has(pairKey)) {
        displayMessage("Táto dvojica klauzúl už bola použitá. Vyberte inú dvojicu.", 'error');
        return;
    }

    const result = resolve(clause1, clause2);

    if (result) {
        clearTree("#dynamic-tree-container");
        clearTableResolutionInterpretation();

        clausesForEach.push(result);
        updateClauseSelections(clausesForEach);
        updateCurrentClausesDisplay(clausesForEach);
        usedPairs.add(pairKey);

        const historyElement = document.getElementById('history');
        const step = { resolved: [clause1, clause2], result: result };
        steps.push(step);
        console.log(steps)

        undoStack.push(step);
        redoStack = [];


        const stepElement = createResolutionStep(step, stepNumber);
        historyElement.appendChild(stepElement);

        if (Array.isArray(result)) {
            document.getElementById('visualization-result').innerHTML =
                step.result.length > 0 ? `$$\\Large{${result.join(' \\vee ')}}$$` : '$$\\bot$$';
        } else {
            document.getElementById('visualization-result').innerHTML = result === "[]" ? '$$\\bot$$' : `$$\\Large{${result}}$$`;
        }

        MathJax.typesetPromise();
        drawTree(buildTreeDataCommon(steps), "#dynamic-tree-container");

        updateResolutionTable(initialClauses);

        if (result.length === 0) {
            displayMessage("Dosiahnutá prázdna klauzula. Formula je dokázaná!", 'warning');
            resolutionFound = true;
        }

        stepNumber++;
    }
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

function formatClause(clauseArray) {
    if (clauseArray.length === 0) {
        return "⊥";
    } else {
        return `{${clauseArray.join(', ')}}`;
    }
}

function updateResolutionTable(initialClauses) {
    const tableContainer = document.getElementById("table-resolution-interpretation");
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("resolution-table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);

    initialClauses.forEach((clauseArray, index) => {
        const row = document.createElement("tr");
        addCell(row, index + 1);
        addCell(row, `{${clauseArray.join(', ')}}`);
        addCell(row, "-");
        tbody.appendChild(row);
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
    });

    tableContainer.appendChild(table);
}

document.addEventListener('DOMContentLoaded', function () {
    const modeSwitches = document.querySelectorAll('input[name="mode"]');

    const dynamicTree = document.querySelector('.Dynamic-Tree');
    const tableResolution = document.getElementById('table-resolution-interpretation');

    function updateVisibility() {
        const selectedMode = document.querySelector('input[name="mode"]:checked').value;

        if (selectedMode === 'tree') {
            dynamicTree.style.display = 'flex';
            tableResolution.style.display = 'none';
        } else if (selectedMode === 'table') {
            dynamicTree.style.display = 'none';
            tableResolution.style.display = 'flex';
        }
    }

    modeSwitches.forEach(function (switcher) {
        switcher.addEventListener('change', updateVisibility);
    });

    updateVisibility();
});

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}
function clearTableResolutionInterpretation() {
    const tableContainer = document.getElementById("table-resolution-interpretation");
    tableContainer.innerHTML = "";
}



document.getElementById('dimacs').addEventListener('click', function() {
    document.getElementById('dimacsInput').click();
});

document.getElementById('dimacsInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    isDIMACS = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        try {
            const expression = parseDIMACS(content);
            insertIntoMonacoEditor(expression);
        } catch (error) {
            showModalError(error.message);
        }
    };
    reader.readAsText(file);
});

function parseDIMACS(content) {
    const lines = content.trim().split('\n');
    let expression = '';
    let hasValidClauses = false;
    let processingClauses = false;

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('p cnf')) {
            processingClauses = true;
            continue;
        }
        if (!processingClauses || !line) {
            continue;
        }

        const terms = line.split(/\s+/);
        if (terms[terms.length - 1] !== '0') {
            throw new Error('Každá klauzula musí byť zakončená nulou.');
        }

        const clause = terms.slice(0, -1).map(term => {
            if (term.startsWith('-')) {
                return '¬' + String.fromCharCode(96 + Math.abs(parseInt(term)));
            } else {
                return String.fromCharCode(96 + parseInt(term));
            }
        }).join(' ∨ ');

        if (clause) {
            expression += (expression ? ' ∧ ' : '') + '(' + clause + ')';
            hasValidClauses = true;
        }
    }

    if (!processingClauses) {
        throw new Error('Súbor neobsahuje platnú hlavičku "p cnf".');
    }
    if (!hasValidClauses) {
        throw new Error('Súbor neobsahuje žiadne platné klauzuly.');
    }

    return expression;
}


function showModalError(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const close = document.getElementById('closeErrorModal');

    errorMessage.textContent = message;
    modal.style.display = "block";

    close.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}

function insertIntoMonacoEditor(expression) {
    editor.setValue(expression);
    startProving();

}

function displayMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${type}`);
    messageDiv.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.onclick = function() {
        messagesContainer.removeChild(messageDiv);
    };
    closeButton.style.float = 'right';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#fff';

    messageDiv.appendChild(closeButton);

    messagesContainer.appendChild(messageDiv);

    setTimeout(() => {
        if (messagesContainer.contains(messageDiv)) {
            messagesContainer.removeChild(messageDiv);
        }
    }, 5000);
}

let buttonSVG = document.createElement('button');
buttonSVG.id = 'download-btn';
buttonSVG.innerHTML = "<svg height=\"200px\" width=\"200px\" version=\"1.1\" id=\"_x32_\" xmlns=\"http://www.w3.org/2000/svg\"  viewBox=\"0 0 512 512\" xml:space=\"preserve\" fill=\"#000000\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"> <style type=\"text/css\"> .st0{fill:#<svg height=\"200px\" width=\"200px\" version=\"1.1\" id=\"_x32_\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 512 512\" xml:space=\"preserve\" fill=\"#000000\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"> <style type=\"text/css\"> .st0{fill:#094e86;} </style> <g> <path class=\"st0\" d=\"M378.409,0H208.294h-13.176l-9.314,9.315L57.017,138.101l-9.314,9.315v13.176v265.513 c0,47.36,38.528,85.896,85.895,85.896h244.811c47.361,0,85.888-38.535,85.888-85.896V85.896C464.297,38.528,425.77,0,378.409,0z M432.493,426.104c0,29.877-24.214,54.091-54.084,54.091H133.598c-29.877,0-54.091-24.214-54.091-54.091V160.592h83.717 c24.884,0,45.07-20.179,45.07-45.071V31.804h170.114c29.87,0,54.084,24.214,54.084,54.091V426.104z\"></path> <path class=\"st0\" d=\"M180.296,296.668l-4.846-0.67c-10.63-1.487-14.265-4.978-14.265-10.104c0-5.78,4.309-9.817,12.383-9.817 c5.653,0,11.305,1.62,15.745,3.764c1.886,0.942,3.903,1.487,5.789,1.487c4.845,0,8.612-3.63,8.612-8.616 c0-3.226-1.481-5.921-4.71-7.939c-5.384-3.372-15.476-6.06-25.572-6.06c-19.781,0-32.436,11.171-32.436,27.998 c0,16.15,10.232,24.898,28.938,27.454l4.846,0.67c10.903,1.48,14.129,4.846,14.129,10.229c0,6.326-5.247,10.766-14.939,10.766 c-6.727,0-12.111-1.745-19.645-5.921c-1.616-0.942-3.634-1.62-5.788-1.62c-5.115,0-8.885,3.91-8.885,8.756 c0,3.226,1.616,6.326,4.713,8.344c6.054,3.764,15.878,7.8,28.798,7.8c23.823,0,35.934-12.24,35.934-28.795 C209.097,307.84,199.273,299.356,180.296,296.668z\"></path> <path class=\"st0\" d=\"M281.108,259.382c-4.577,0-7.939,2.43-9.556,7.674l-16.69,54.51h-0.402l-17.634-54.51 c-1.745-5.244-4.978-7.674-9.551-7.674c-5.653,0-9.692,4.176-9.692,9.287c0,1.347,0.269,2.834,0.67,4.175l23.286,68.104 c2.96,8.477,6.727,11.57,12.652,11.57c5.785,0,9.555-3.093,12.516-11.57l23.282-68.104c0.406-1.341,0.674-2.828,0.674-4.175 C290.664,263.558,286.76,259.382,281.108,259.382z\"></path> <path class=\"st0\" d=\"M364.556,300.836h-18.841c-5.114,0-8.344,3.1-8.344,7.806c0,4.713,3.23,7.814,8.344,7.814h6.193 c0.538,0,0.803,0.258,0.803,0.803c0,3.505-0.265,6.598-1.075,9.014c-1.882,5.796-7.67,9.426-14.669,9.426 c-7.943,0-12.921-3.903-14.939-10.096c-1.075-3.365-1.48-7.8-1.48-19.648c0-11.842,0.405-16.15,1.48-19.516 c2.018-6.325,6.867-10.228,14.67-10.228c5.924,0,10.362,1.885,13.859,6.724c2.695,3.777,5.387,4.852,8.749,4.852 c4.981,0,9.021-3.638,9.021-8.888c0-2.151-0.674-4.035-1.752-5.921c-4.842-8.204-15.071-14.264-29.877-14.264 c-16.287,0-28.935,7.408-33.644,22.204c-2.022,6.466-2.559,11.576-2.559,25.038c0,13.454,0.538,18.573,2.559,25.031 c4.709,14.802,17.357,22.204,33.644,22.204c16.286,0,28.668-8.204,33.374-22.881c1.617-5.111,2.29-12.645,2.29-20.716v-0.95 C372.362,303.664,369.538,300.836,364.556,300.836z\"></path> </g> </g></svg>;} </style> <g> <path class=\"st0\" d=\"M378.409,0H208.294h-13.176l-9.314,9.315L57.017,138.101l-9.314,9.315v13.176v265.513 c0,47.36,38.528,85.896,85.895,85.896h244.811c47.361,0,85.888-38.535,85.888-85.896V85.896C464.297,38.528,425.77,0,378.409,0z M432.493,426.104c0,29.877-24.214,54.091-54.084,54.091H133.598c-29.877,0-54.091-24.214-54.091-54.091V160.592h83.717 c24.884,0,45.07-20.179,45.07-45.071V31.804h170.114c29.87,0,54.084,24.214,54.084,54.091V426.104z\"></path> <path class=\"st0\" d=\"M180.296,296.668l-4.846-0.67c-10.63-1.487-14.265-4.978-14.265-10.104c0-5.78,4.309-9.817,12.383-9.817 c5.653,0,11.305,1.62,15.745,3.764c1.886,0.942,3.903,1.487,5.789,1.487c4.845,0,8.612-3.63,8.612-8.616 c0-3.226-1.481-5.921-4.71-7.939c-5.384-3.372-15.476-6.06-25.572-6.06c-19.781,0-32.436,11.171-32.436,27.998 c0,16.15,10.232,24.898,28.938,27.454l4.846,0.67c10.903,1.48,14.129,4.846,14.129,10.229c0,6.326-5.247,10.766-14.939,10.766 c-6.727,0-12.111-1.745-19.645-5.921c-1.616-0.942-3.634-1.62-5.788-1.62c-5.115,0-8.885,3.91-8.885,8.756 c0,3.226,1.616,6.326,4.713,8.344c6.054,3.764,15.878,7.8,28.798,7.8c23.823,0,35.934-12.24,35.934-28.795 C209.097,307.84,199.273,299.356,180.296,296.668z\"></path> <path class=\"st0\" d=\"M281.108,259.382c-4.577,0-7.939,2.43-9.556,7.674l-16.69,54.51h-0.402l-17.634-54.51 c-1.745-5.244-4.978-7.674-9.551-7.674c-5.653,0-9.692,4.176-9.692,9.287c0,1.347,0.269,2.834,0.67,4.175l23.286,68.104 c2.96,8.477,6.727,11.57,12.652,11.57c5.785,0,9.555-3.093,12.516-11.57l23.282-68.104c0.406-1.341,0.674-2.828,0.674-4.175 C290.664,263.558,286.76,259.382,281.108,259.382z\"></path> <path class=\"st0\" d=\"M364.556,300.836h-18.841c-5.114,0-8.344,3.1-8.344,7.806c0,4.713,3.23,7.814,8.344,7.814h6.193 c0.538,0,0.803,0.258,0.803,0.803c0,3.505-0.265,6.598-1.075,9.014c-1.882,5.796-7.67,9.426-14.669,9.426 c-7.943,0-12.921-3.903-14.939-10.096c-1.075-3.365-1.48-7.8-1.48-19.648c0-11.842,0.405-16.15,1.48-19.516 c2.018-6.325,6.867-10.228,14.67-10.228c5.924,0,10.362,1.885,13.859,6.724c2.695,3.777,5.387,4.852,8.749,4.852 c4.981,0,9.021-3.638,9.021-8.888c0-2.151-0.674-4.035-1.752-5.921c-4.842-8.204-15.071-14.264-29.877-14.264 c-16.287,0-28.935,7.408-33.644,22.204c-2.022,6.466-2.559,11.576-2.559,25.038c0,13.454,0.538,18.573,2.559,25.031 c4.709,14.802,17.357,22.204,33.644,22.204c16.286,0,28.668-8.204,33.374-22.881c1.617-5.111,2.29-12.645,2.29-20.716v-0.95 C372.362,303.664,369.538,300.836,364.556,300.836z\"></path> </g> </g></svg>"
buttonSVG.style.display = 'none';
buttonSVG.setAttribute('title', 'Stiahnuť strom vo formáte SVG');

buttonDynamicSVG.setAttribute('title', 'Stiahnuť strom vo formáte SVG');

let buttonLaTeX = document.createElement('button');
buttonLaTeX.id = 'latex-tree-generate';
buttonLaTeX.innerHTML = "<svg viewBox=\"0 0 64 64\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"><path d=\"M18.525 31.482h-.482c-.192 1.966-.462 4.357-3.855 4.357h-1.562c-.905 0-.944-.136-.944-.772V24.831c0-.655 0-.925 1.812-.925h.636v-.578c-.694.058-2.429.058-3.22.058-.751 0-2.255 0-2.91-.058v.578h.443c1.485 0 1.523.212 1.523.906v10.12c0 .694-.038.907-1.523.907H8v.597h10.005l.52-4.954z\" fill=\"#094e86\"></path><path d=\"M18.198 23.308c-.078-.23-.116-.308-.367-.308-.25 0-.308.077-.385.308l-3.104 7.866c-.135.327-.366.925-1.561.925v.482h2.988v-.482c-.598 0-.964-.27-.964-.656 0-.096.02-.135.058-.27l.655-1.657h3.817l.771 1.966a.65.65 0 0 1 .077.231c0 .386-.732.386-1.099.386v.482h3.798v-.482h-.27c-.906 0-1.002-.135-1.137-.52l-3.277-8.27zm-.771 1.37 1.715 4.356h-3.431l1.716-4.357z\" fill=\"#094e86\"></path><path d=\"M33.639 23.443h-11.74l-.347 4.318h.463c.27-3.103.558-3.74 3.47-3.74.346 0 .848 0 1.04.04.405.076.405.288.405.732v10.12c0 .656 0 .926-2.024.926h-.771v.597c.79-.058 2.737-.058 3.624-.058s2.872 0 3.663.058v-.597h-.771c-2.024 0-2.024-.27-2.024-.926v-10.12c0-.386 0-.656.347-.733.212-.038.732-.038 1.098-.038 2.892 0 3.181.636 3.45 3.74h.483l-.366-4.319z\" fill=\"#094e86\"></path><path d=\"M43.971 35.82h-.482c-.482 2.949-.925 4.356-4.221 4.356h-2.545c-.906 0-.945-.135-.945-.771v-5.128h1.716c1.87 0 2.082.617 2.082 2.255h.482v-5.089h-.482c0 1.639-.212 2.236-2.082 2.236h-1.716v-4.607c0-.636.039-.77.945-.77h2.467c2.95 0 3.451 1.06 3.76 3.739h.481l-.54-4.318H32.097v.578h.444c1.484 0 1.523.212 1.523.906V39.27c0 .694-.039.906-1.523.906h-.444v.597h11.065l.81-4.954z\" fill=\"#094e86\"></path><path d=\"m49.773 29.014 2.641-3.855c.405-.617 1.06-1.234 2.776-1.253v-.578h-4.588v.578c.772.02 1.196.443 1.196.887 0 .192-.039.231-.174.443l-2.198 3.239-2.467-3.702c-.039-.057-.135-.212-.135-.289 0-.231.424-.559 1.234-.578v-.578c-.656.058-2.063.058-2.795.058-.598 0-1.793-.02-2.506-.058v.578h.366c1.06 0 1.426.135 1.793.675l3.527 5.34-3.142 4.645c-.27.386-.848 1.273-2.776 1.273v.597h4.588v-.597c-.886-.02-1.214-.54-1.214-.887 0-.174.058-.25.193-.463l2.718-4.029 3.045 4.588c.039.077.097.154.097.212 0 .232-.424.56-1.253.579v.597c.675-.058 2.082-.058 2.795-.058.81 0 1.696.02 2.506.058v-.597h-.366c-1.003 0-1.407-.097-1.812-.694l-4.049-6.13z\" fill=\"#094e86\"></path></g></svg>";
buttonLaTeX.style.display = 'none';
buttonLaTeX.setAttribute('title', 'LaTeX');


function showResultOfResolutionMethod(result) {
    const resolutionResultElement = document.getElementById('resolution-result');
    const inputFormula = model.getValue();
    const lines = inputFormula.split('\n').filter(line => line.trim() !== '');
    const relevantLine = inputFormula.split('\n').find(line => line.includes('⊢'));

    if (lines.some(line => line.includes('⊢'))) {
        const formulaLaTeX = convertFormulasToLatex(relevantLine);
        resolutionResultElement.innerHTML = result.isProved ?
            "Formula \\(" + formulaLaTeX + "\\) je <strong style='color: #09866B'>dokázaná</strong>." :
            "Formula \\(" + formulaLaTeX + "\\) <strong style='color: #861809'>nie je dokázaná (splniteľná)</strong>.";
    } else if (lines.length === 1) {
        const formulaLaTeX = convertFormulasToLatex(formula.toString());
        resolutionResultElement.innerHTML = result.isProved ?
            "Formula \\(" + formulaLaTeX + "\\) je <strong style='color: #09866B'>dokázaná</strong>." :
            "Formula \\(" + formulaLaTeX + "\\) <strong style='color: #861809'>nie je dokázaná (splniteľná)</strong>.";
    } else if (lines.length >= 2) {
        resolutionResultElement.innerHTML = result.isProved
            ? "Formula " + logicalConsequence.map(cnf => "\\((" + convertFormulasToLatex(cnf.toString()) + "\\))").join(' \\( \\wedge \\) ') + " je <strong style='color: #09866B'>dokázaná</strong>."
            : "Formula " + logicalConsequence.map(cnf => "\\((" + convertFormulasToLatex(cnf.toString()) + "\\))").join(' \\( \\wedge \\)') + " <strong style='color: #861809'>nie je dokázaná (splniteľná)</strong>.";

    }
}

/**
 * Generates an explanation of resolution method, including visualizing trees and interactive proving
 * @param clauses
 */
function resolutionExplanation(clauses) {
    clausesForEach = clauses;
    initialClauses = clauses;
    stepNumber = 0;
    steps = [];
    usedPairs.clear();
    resolutionFound = false;

    const resolutionContainer = document.getElementById("resolution-container");

    const stepByStepContainer = document.getElementById('stepByStepResolution');
    stepByStepContainer.style.display = 'block';

    console.log(clauses)

    const strategyFunctions = {
        withoutStrategy: resolutionCommon,
        linearResolution: resolutionLinear,
        unitResolution: resolutionUnit
    };

    const currentStrategy = isWithoutStrategy ? 'withoutStrategy'
        : isLinearResolution ? 'linearResolution'
            : isUnitResolution ? 'unitResolution'
                : null;

    let result = currentStrategy ? strategyFunctions[currentStrategy](clauses) : null;


    console.log("STEPS COMMON: ", result.steps)
    clearTree("#dynamic-tree-container");
    clearTableResolutionInterpretation();
    clearTree("#tree-container");

    // TODO: make a condition 'if(result.isProved === false)'

    if (result.steps.length === 0) {
        resolutionContainer.textContent = 'Žiadne kroky rezolúcie neboli vykonané, nenašli sa komplementárne literály.';
        resolutionContainer.style.textAlign = 'center';
        buttonSVG.style.display = 'none';
        buttonLaTeX.style.display = 'none';
        showResultOfResolutionMethod(result);
        isAnySteps = false;
    } else {
        const downloadSVG_button = document.getElementById('download-svg-button');
        const downloadLaTeX_button = document.getElementById('download-latex-button');

        isAnySteps = true;

        produceResolutionSteps();

        if(isAnySteps) {
            downloadSVG_button.appendChild(buttonSVG);
            downloadLaTeX_button.appendChild(buttonLaTeX);
        }

        let treeData;

        if (isLinearResolution) {
            treeData = buildTreeDataLinear(result.steps);
        } else if (isWithoutStrategy || isUnitResolution) {
            treeData = buildTreeDataCommon(result.steps);
        }

        console.log(treeData)

        let tikzCode = buildTikzPicture(treeData);

        buttonLaTeX.onclick = function() {
            showModalWithText(tikzCode);
        };

        console.log(tikzCode);

        if (treeData) {
            drawTree(treeData, "#tree-container");
        }
    }


    // INTERACTIVE PROVING OF PROPOSITIONAL LOGIC FORMULAS, USING SELECT ELEMENTS

    clauses = clauses.filter(clause => clause.length > 0);
    updateCurrentClausesDisplay(clauses);
    updateClauseSelections(clauses);

    // Explain steps of resolution method
    function produceResolutionSteps() {
        // Produces and visualizes steps of resolution method & shows actual clauses
        result.steps.forEach((step, index) => {
            const stepElement = createResolutionStep(step, index);
            const clausesElement = document.createElement('div');
            const latexClauses = convertActualClausesToLatex(step.clauses);
            clausesElement.innerHTML = `Aktuálne klauzuly: ${latexClauses}`;
            stepElement.appendChild(clausesElement);
            const lineCut = document.createElement('div');
            lineCut.className = 'line-cut';
            stepElement.appendChild(lineCut);
            resolutionContainer.appendChild(stepElement);
        });
        // Result of resolution method (formula is proved/isn't proved)
        showResultOfResolutionMethod(result);
    }
}


function generateTikzCode(node, indentLevel = 1, isRoot = false) {
    let childIndent = "\t".repeat(indentLevel + 1);

    let nodeName = node.name
        .replace("□", "$\\square$")
        .replace(/\{([^}]*)}/g, (match, p1) => `{$\\{${p1.replace("¬", "\\neg ")}\\}$}`);


    if (!node.children || node.children.length === 0) {
        return `${isRoot ? '\\node' : 'node'} {${nodeName}}`;
    }

    let childrenStr = node.children.map((child, index) => {
        let suffix = (isRoot && index === node.children.length - 1) ? ';' : '';
        return `${childIndent}child {${generateTikzCode(child, indentLevel + 2)} edge from parent}${suffix}\n`;
    }).join('');

    return `${isRoot ? '\\node' : 'node'} {${nodeName}} [grow=up]\n${childrenStr}`;
}

function buildTikzPicture(treeData) {
    let tikzStr = "\\begin{tikzpicture}\n";

    tikzStr += generateTikzCode(treeData,1,true);

    tikzStr += "\\end{tikzpicture}";

    return tikzStr;
}

function convertFormulasToLatex(expression) {

    return expression
        .replace(/⇒/g, '\\Rightarrow ')
        .replace(/∧/g, '\\wedge ')
        .replace(/∨/g, '\\vee ')
        .replace(/¬/g, '\\neg ')
        .replace(/⊢/g, '\\vdash ');
}

function convertClausesToLatex(clauses) {
    return clauses.map(clause =>
            "\\left\\{" + clause.map(literal => {
                return literal;
            }).join(', ') + "\\right\\}"
    ).join(', ');
}

function convertActualClausesToLatex(clauses) {
    return clauses.map((clause, index) => {
        const clauseArray = Array.isArray(clause) ? clause : [clause];
        if (clauseArray.length === 0) {
            return "\\(\\color{green}{\\bot}\\)";
        } else {
            const isLastClause = index === clauses.length - 1;
            const clauseText = clauseArray.map(literal => literal).join(', ');
            if (isLastClause) {
                return `{\\(\\color{green}{${clauseText}}\\)}`;
            } else {
                return `{\\(${clauseText}\\)}`;
            }
        }
    }).join(', ');
}

function convertInteractiveActualClausesToLatex(clauses) {
    if (clauses.length === 0) {
        return "\\(\\bot\\)";
    }
    return "{\\(" + clauses.join(', ') + "\\)}";
}


editor.onDidChangeModelContent((event) => {
    let edits = [];
    const inputFormula = model.getValue();
    const replacementPattern = /\/\/\//g;
    let newText = inputFormula.replace(replacementPattern, '---------------\n');

    if (inputFormula !== newText) {
        edits.push({
            range: model.getFullModelRange(),
            text: newText
        });

        editor.executeEdits('', edits);

        const numberOfLines = newText.split('\n').length;
        editor.setPosition({ lineNumber: numberOfLines, column: 1 });
    }


    const lines = inputFormula.split('\n')
    console.log("LINES BABE", lines)



    if(inputFormula.includes('⊢')) {
        logicalConsequence = checkSyntax(inputFormula, false);
        document.getElementById('c1').disabled = true;
    } else if (lines.length === 1) {

        formula = checkSyntax(inputFormula, true);
        document.getElementById('c1').disabled = false
    } else if (lines.length > 1) {
        logicalConsequence = checkSyntax(inputFormula, false);
        document.getElementById('c1').disabled = true;

    }
});

document.querySelectorAll('.keyboard-button').forEach(button => {
    button.addEventListener('click', function() {
        const value = this.getAttribute('data-value');

        const selection = editor.getSelection();
        const range = new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);

        editor.executeEdits('', [{
            range: range,
            text: value,
            forceMoveMarkers: true
        }]);

        const newPosition = editor.getPosition();
        editor.setPosition({
            lineNumber: newPosition.lineNumber,
            column: newPosition.column + value.length
        });

        editor.focus();
    });
});



document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

function undo() {
    if (undoStack.length === 0) {
        displayMessage("Nie je možné vykonať krok späť.", 'error');
        return;
    }

    resolutionFound = false;

    clausesForEach.pop();

    const lastAction = undoStack.pop();
    redoStack.push(lastAction);

    console.log("usedPairs before: ", usedPairs)


    let tempArray = Array.from(usedPairs);

    tempArray.pop();

    usedPairs = new Set(tempArray);

    steps.pop();
    console.log("usedPairs after: ", usedPairs)
    console.log(steps);
    updateUIAfterUndoOrRedo();
}

function redo() {
    if (redoStack.length === 0) {
        displayMessage("Nie je možné vykonať krok vpred.", 'error');
        return;
    }

    const lastUndoneAction = redoStack.pop();
    clausesForEach.push(lastUndoneAction.result);
    undoStack.push(lastUndoneAction);

    const resolvedParts = lastUndoneAction.resolved.map(subArray => subArray.join(","));
    const pairKey = resolvedParts.join("-");

    usedPairs.add(pairKey);

    console.log("LUA", lastUndoneAction)

    console.log("used pairs in redo", usedPairs)

    if(lastUndoneAction.result.length === 0 ) {
        resolutionFound = true;
    }

    steps.push(lastUndoneAction);
    updateUIAfterUndoOrRedo();
}

function updateUIAfterUndoOrRedo() {
    updateCurrentClausesDisplay(clausesForEach);
    updateClauseSelections(clausesForEach);
    clearTree("#dynamic-tree-container")
    clearTableResolutionInterpretation();
    if(steps.length !== 0) {
        drawTree(buildTreeDataCommon(steps), "#dynamic-tree-container");
        updateResolutionTable(initialClauses);
    }

    if(steps.length === 0) {
        document.getElementById('visualization-result').innerHTML = '';
    } else if (Array.isArray(steps[steps.length - 1].result)) {
        document.getElementById('visualization-result').innerHTML =
            steps[steps.length - 1].result.length > 0 ? `$$\\Large{${steps[steps.length - 1].result.join(' \\vee ')}}$$` : '$$\\bot$$';
    } else {
        document.getElementById('visualization-result').innerHTML = steps[steps.length - 1].result === "[]" ? '$$\\bot$$' : `$$\\Large{${steps[steps.length - 1].result}}$$`;
    }


    MathJax.typesetPromise();
}

strategiesSelect.addEventListener('change', function() {
    isWithoutStrategy = this.value === 'without-strategy';
    isLinearResolution = this.value === 'linear-resolution';
    isUnitResolution = this.value === 'unit-resolution';

    wasStrategyChanged = true;
});


document.getElementById('toggleHistory').onclick = function() {
    const historyDiv = document.getElementById('history');
    if (historyDiv.style.right === '0px') {
        historyDiv.style.right = '-100%';
    } else {
        historyDiv.style.right = '0px';
    }
};

const modal = document.getElementById("myModal");
const btn = document.getElementById("help");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
    openTab(null, 'Všeobecné');
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}


function replaceText() {
    const model = editor.getModel();
    const selection = editor.getSelection();

    if (selection.startLineNumber === selection.endLineNumber && selection.startColumn === selection.endColumn) {
        const position = {
            lineNumber: selection.startLineNumber,
            column: selection.startColumn
        };

        const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        const replacements = [
            { searchFor: "=>", replaceWith: "⇒" },
            { searchFor: "&&", replaceWith: "∧" },
            { searchFor: "\\|\\|", replaceWith: "∨" },
            { searchFor: "!", replaceWith: "¬" },
            { searchFor: "<=>", replaceWith: "⇔" }
        ];

        replacements.forEach(({ searchFor, replaceWith }) => {
            const regex = new RegExp(searchFor + '$');
            if (regex.test(textUntilPosition)) {
                const match = textUntilPosition.match(regex);
                const range = new monaco.Range(position.lineNumber, position.column - match[0].length, position.lineNumber, position.column);
                editor.executeEdits('', [{ range, text: replaceWith }]);

                editor.setPosition({
                    lineNumber: position.lineNumber,
                    column: position.column - match[0].length + replaceWith.length
                });
            }
        });
    }
}

editor.onDidChangeModelContent((event) => {
    replaceText();
});

document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('c1');

    isChecked = checkbox.checked;

    checkbox.addEventListener('change', function() {
        isChecked = checkbox.checked;
        console.log('isChecked:', isChecked);
    });
});

document.getElementById('keyboard-icon').addEventListener('click', function() {
    const keyboard = document.getElementById('keyboard-container');
    keyboard.style.display = keyboard.style.display === 'none' ? 'block' : 'none';
    const rootStyle = document.documentElement.style;
    const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--keyboard-icon-color').trim();
    const newColor = currentColor === '#094e86' ? '#d6d6d6' : '#094e86';

    rootStyle.setProperty('--keyboard-icon-color', newColor);
});



document.getElementById('toggleVisibilityButton').addEventListener('click', function() {
    const resolutionContainer = document.getElementById('resolution-container');
    const treeContainer = document.getElementById('tree-container');
    const button = document.getElementById('toggleVisibilityButton');
    const dotLines = document.getElementsByClassName('dotted-line-background');

    if (resolutionContainer.style.display === "none") {
        resolutionContainer.style.display = "block";
        treeContainer.style.display = "block";
        button.textContent = "Skryť kroky";
        button.style.backgroundColor = 'white';
        button.style.color = '#094e86';
        button.style.border = '2px solid #f5f5f5';
        dotLines[0].style.visibility = 'visible';
        dotLines[1].style.visibility = 'visible';

        console.log(isAnySteps)

        if(isAnySteps) {
            buttonSVG.style.display = 'block';
            buttonLaTeX.style.display = 'block';
        } else {
            buttonSVG.style.display = 'none';
            buttonLaTeX.style.display = 'none';
        }

        buttonSVG.addEventListener('click', function() {
            const svgElement = document.querySelector('#tree-container svg');
            downloadSVG(svgElement, 'my-tree.svg', cssStyles);
        });


        setTimeout(() => {
            resolutionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } else {
        resolutionContainer.style.display = "none";
        treeContainer.style.display = "none";
        button.textContent = "Zobraziť kroky";
        button.style.backgroundColor = '#094e86';
        button.style.color = 'white';
        button.style.border = 'none';
        dotLines[0].style.visibility = 'hidden';
        dotLines[1].style.visibility = 'hidden';
        buttonSVG.style.display = 'none';
        buttonLaTeX.style.display = 'none';
    }
});

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.color = "grey";
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    if (evt ) {
        evt.currentTarget.style.color = "#094e86";
    } else {
        for (i = 0; i < tablinks.length; i++) {
            if (tablinks[i].textContent === 'Všeobecné') {
                tablinks[i].style.color = "#094e86";
                tablinks[i].classList.add("active");
                break;
            }
        }
    }
}

window.openTab = openTab;

function formulaExplanation(explanation) {
    if (explanation.resolutionContainer.style.display === "block") {
        explanation.dotLines[0].style.visibility = 'visible';
        explanation.dotLines[1].style.visibility = 'visible';
    }
    let negFormula = formula;
    if (!isChecked && !isDIMACS) {
        negFormula = negFormula.not();
        const latexNegFormulaString = convertFormulasToLatex(negFormula.toString());

        explanation.negationFormula.style.visibility = 'visible';
        explanation.descFormula.innerHTML = "<strong>1. krok</strong> je <strong>negácia</strong> formuly: ";
        explanation.negatedFormula.innerHTML = `$$${latexNegFormulaString}$$`;
    }

    let simplifiedCnfFormula;
    const CNF = negFormula.cnf();


    if (!isDIMACS) {
        simplifiedCnfFormula = Formula.simplifyCnfFormula(CNF);

        if (simplifiedCnfFormula === '⊤') {
            explanation.cnfResult.style.visibility = 'visible';
            if (!isChecked) {
                explanation.descCNF.innerHTML = "<strong>2. krokom</strong> je prevod formuly do <strong>CNF</strong>: ";
            } else {
                explanation.descCNF.innerHTML = "<strong>1. krok</strong> je prevod formuly do <strong>CNF</strong>: ";
            }

            explanation.CNFMessage.innerHTML = '$$\\top$$';
        } else {
            const latexCnfString = convertFormulasToLatex(simplifiedCnfFormula.toString());
            explanation.cnfResult.style.visibility = 'visible';
            if (!isChecked) {
                explanation.descCNF.innerHTML = "<strong>2. krokom</strong> je prevod formuly do <strong>CNF</strong>: ";
            } else {
                explanation.descCNF.innerHTML = "<strong>1. krok</strong> je prevod formuly do <strong>CNF</strong>: ";
            }
            explanation.CNFMessage.innerHTML = `$$${latexCnfString}$$`;
        }
    } else {
        simplifiedCnfFormula = CNF;
    }


    const clauses = Formula.extractClauses(simplifiedCnfFormula);
    console.log('clauses ura ', clauses)
    const latexClausesString = convertClausesToLatex(clauses);

    document.getElementById('export-dimacs').addEventListener('click', () => {
        try {
            const dimacsText = clausesToDIMACSCNF(clauses);
            showModalWithText(dimacsText);
        } catch (error) {
            showModalWithText('Chyba prevodu: ' + error.message);
        }
    });


    explanation.clausesResult.style.visibility = 'visible';
    if (!isChecked) {
        if(isDIMACS) {
            explanation.descClauses.innerHTML = "<strong>1. krokom</strong> je použitie <strong>pravidla rezolúcie</strong> na jednotlivé klauzuly: ";
        } else {
            explanation.descClauses.innerHTML = "<strong>3. krokom</strong> je použitie <strong>pravidla rezolúcie</strong> na jednotlivé klauzuly: ";
        }
    } else {
        if(isDIMACS) {
            explanation.descClauses.innerHTML = "<strong>1. krokom</strong> je použitie <strong>pravidla rezolúcie</strong> na jednotlivé klauzuly: ";
        } else {
            explanation.descClauses.innerHTML = "<strong>2. krokom</strong> je použitie <strong>pravidla rezolúcie</strong> na jednotlivé klauzuly: ";
        }
    }

    if(simplifiedCnfFormula === '⊤') {
        explanation.clausesMessage.innerHTML = '$$\\top$$';
    } else {
        explanation.clausesMessage.innerHTML = `$$${latexClausesString}$$`;
    }

    isDIMACS = false;
    resolutionExplanation(clauses);
}

function showModalWithText(text) {
    const modal = document.getElementById("myModalDIMACS");
    const textElement = document.getElementById("modalText");
    const copyButton = document.getElementById("copyButton");

    textElement.textContent = text;

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log("Text copied to clipboard");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    copyButton.onclick = () =>  {
        copyToClipboard(textElement.textContent);
        let tooltip = document.querySelector('.tooltiptext');
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        setTimeout(() => { tooltip.style.visibility = 'hidden'; tooltip.style.opacity = '0'; }, 2000);
    };


    modal.style.display = "block";

    const span = document.getElementById('closeDimacs')

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}



function clausesToDIMACSCNF(clauses) {
    const variables = new Set();
    const cnfClauses = clauses.map(clause => {
        return clause.map(variable => {
            const isNegated = variable.startsWith('¬');
            const varName = isNegated ? variable.slice(1) : variable;
            variables.add(varName);
            return (isNegated ? '-' : '') + (Array.from(variables).indexOf(varName) + 1);
        }).join(' ') + ' 0';
    });

    return `p cnf ${variables.size} ${clauses.length}\n` + cnfClauses.join('\n');
}

function logicalSyllogismExplanation(explanation) {
    if (explanation.resolutionContainer.style.display === "block") {
        explanation.dotLines[0].style.visibility = 'visible';
        explanation.dotLines[1].style.visibility = 'visible';
    }

    console.log(logicalConsequence)

    if(!wasStrategyChanged) {

        logicalConsequence[logicalConsequence.length - 1] = logicalConsequence[logicalConsequence.length - 1].not();
    }

    for (let i = 0; i < logicalConsequence.length; i++) {
        logicalConsequence[i] = logicalConsequence[i].cnf();
    }

    let combinedCNFString = logicalConsequence.slice(0, -1) // Создаем копию массива без последнего элемента
        .map(cnf => "(" + cnf.toString() + ")").join(' ∧ ');
    const latexNegFormulaString = convertFormulasToLatex(combinedCNFString);

    explanation.negationFormula.style.visibility = 'visible';
    explanation.descFormula.textContent = '1. krok je preklad predpokladov do CNF (predpoklady sú v konjunkcii): '
    explanation.descFormula.innerHTML = "<strong>1. krok</strong> je preklad predpokladov do <strong>CNF</strong> (predpoklady sú v konjunkcii): ";
    explanation.negatedFormula.innerHTML = `$$${latexNegFormulaString}$$`;

    const negatedCnfConclusion = convertFormulasToLatex((logicalConsequence[logicalConsequence.length - 1].cnf()).toString());
    explanation.cnfResult.style.visibility = 'visible';
    explanation.descCNF.textContent = '2. krokom je negácia záveru a jeho preklad do CNF: '
    explanation.descCNF.innerHTML = "<strong>2. krokom</strong> je <strong>negácia záveru</strong> a jeho preklad do <strong>CNF</strong>: ";

    explanation.CNFMessage.innerHTML = `$$${negatedCnfConclusion}$$`;

    const clauses = Formula.extractClausesFromCNFArray(logicalConsequence);

    document.getElementById('export-dimacs').addEventListener('click', () => {
        try {
            const dimacsText = clausesToDIMACSCNF(clauses);
            showModalWithText(dimacsText);
        } catch (error) {
            showModalWithText('Chyba prevodu: ' + error.message);
        }
    });


    const latexClausesString = convertClausesToLatex(clauses);

    explanation.clausesResult.style.visibility = 'visible';
    explanation.descClauses.innerHTML = "<strong>3. krokom</strong> je použitie <strong>pravidla rezolúcie</strong> na jednotlivé klauzuly: ";

    explanation.clausesMessage.innerHTML = `$$${latexClausesString}$$`;

    resolutionExplanation(clauses);
}

let lastInputTry = null;

function startProving() {
    const inputFormula = model.getValue();
    if (inputFormula !== lastInputTry || isChecked !== lastIsChecked || wasStrategyChanged) {
        const lines = inputFormula.split('\n').filter(line => line.trim() !== '');
        const explanation = divsOfExplanation();
        explanation.resultInterpretation.style.visibility = 'visible';
        explanation.stepsExplanation.style.visibility = 'visible';
        explanation.dotLines[0].style.visibility = 'hidden';
        explanation.dotLines[1].style.visibility = 'hidden';


        if(inputFormula.includes("⊢")) {
            logicalSyllogismExplanation(explanation);
        } else if (lines.length === 1) {
            formulaExplanation(explanation);
        } else if (lines.length >= 2) {
            logicalSyllogismExplanation(explanation);
        }

        MathJax.typesetPromise();
        lastInputTry = inputFormula;
        lastIsChecked = isChecked;
        wasStrategyChanged = false;
    }
}

document.getElementById('resolveButton').addEventListener('click', function() {
    startProving();
});