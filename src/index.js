const antlr4 = require('antlr4');
import PropositionalLogicLexer from "../antlr-generated/PropositionalLogicLexer";
import PropositionalLogicParser from "../antlr-generated/PropositionalLogicParser";
import PropositionalLogicVisitor from "../antlr-generated/PropositionalLogicVisitor";
import Formula from "./cnf-converter"
import { initializeMonacoEditor, getModel, getEditor, displayError, monaco } from './monaco-editor';
import {buildTreeDataCommon, buildTreeDataLinear, buildTikzPicture,
    drawTree, downloadSVG, clearTree} from "./proof-tree"
import {
    createResolutionStep, divsOfExplanation, clearTableResolutionInterpretation,
    updateCurrentClausesDisplay, updateClauseSelections, convertFormulasToLatex,
    convertActualClausesToLatex, convertClausesToLatex, updateResolutionTable, initControlButtons
} from './ui'

export let steps = []; // current special structure of clausesForEach
let formula = null; // current value// of user's FORMULA input
let logicalConsequence = []; // // current value of user's LOGICAL CONSEQUENCE input
let clausesForEach = []; // current clauses in a moment of submitting the input formulas/conditions/conclusions
let stepNumber = 0; // current step number in interactive proving formulas mode
let undoStack = [];
let redoStack = [];
let resolutionFound = false; // is resolution was found by the method
let usedPairs = new Set(); // used pairs of clauses by user's
let isNegationChecked = false; // is radio button which represents if formula was negated checked
let isDIMACS = false; // check if user wants to get dimacs formula type
let lastIsChecked; // was
let isWithoutStrategy = true; // proof without strategy
let isLinearResolution = false; // linear proof
let isUnitResolution = false; // unit strategy proof
let wasStrategyChanged = false; // check if strategy was changed and user can query another feedback
let initialClauses = []; // initial clauses of formula
let isAnySteps = false; // if was produced any steps of proof strategy
let isProvingStarted = false; // was started at least one proof process
let lastInputTry = null; // which one proof was started

const resolveButton = document.getElementById('resolveButton'); // button, which executes FORMULA scenario
const buttonDynamicSVG = document.getElementById('download-btn-dynamic'); // download SVG dynamic tree button
buttonDynamicSVG.setAttribute('title', 'Stiahnuť strom vo formáte SVG');
const strategiesSelect = document.getElementById('strategiesResolution');
const applyResolutionButton = document.getElementById('applyResolutionButton');
applyResolutionButton.addEventListener('click', applyResolution); // applies resolution rule on two clauses

let buttonSVG = document.createElement('button');
buttonSVG.id = 'download-btn';
buttonSVG.innerHTML = '<svg fill="#094e86" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 585.918 585.918" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M357.396,535.335c0.776,0.042,1.542,0.115,2.329,0.115h177.39c20.75,0,37.627-16.883,37.627-37.628V86.604 c0-20.743-16.877-37.628-37.627-37.628h-177.39c-0.781,0-1.553,0.069-2.329,0.113V0L11.176,46.207v492.31l346.22,47.401V535.335z M357.396,272.575v-17.651h2.592v-8.097l11.014-9.9L357.396,272.575z M379.82,235.869h4.758v-2.688h12.104v2.231l-39.286,103.259 v-44.096L379.82,235.869z M553.24,352.624h-1.122l0.167-53.325h0.955V352.624z M359.726,70.479h177.39 c8.893,0,16.125,7.233,16.125,16.125v199.9h-11.411v2.688H487.78v-2.688h-12.976v12.794h2.151v12.296h-2.151v12.977h12.976v-2.337 h19.087c-5.532,5.423-11.946,8.783-19.443,10.19v-1.838h-12.798v2.015c-8.347-1.117-15.465-4.607-21.681-10.624 c-6.168-5.973-9.848-12.894-11.17-21.071h1.563v-12.974h-1.795c1.233-8.325,4.903-15.425,11.159-21.63 c6.269-6.213,13.46-9.813,21.923-10.947v2.015h12.798v-1.716c5.848,1.039,11.224,3.404,16.047,7.063v6.656h12.977v-2.312 l18.022,0.129v2.179h12.977v-12.801h-5.664c-5.99-9.838-13.917-17.893-23.598-23.969c-9.37-5.89-19.7-9.372-30.771-10.393v-3.087 h-12.798v3.027c-17.492,1.251-32.715,8.223-45.292,20.743c-12.577,12.515-19.633,27.656-20.999,45.035h-3.043v12.974h3.076 c1.596,17.271,8.755,32.263,21.35,44.61c12.566,12.336,27.658,19.202,44.908,20.451v2.688h12.798v-2.761 c10.772-1.104,20.841-4.536,30.026-10.206v9.744h12.8v-2.509h11.579v2.509h11.412v132.4c0,8.893-7.233,16.127-16.127,16.127 H359.716c-0.793,0-1.564-0.127-2.33-0.243V365.237h2.272v-9.622l-0.1-0.566l45.518-119.18h4.394v-12.795h-12.798v2.144h-12.109 v-0.478l20.697-18.599h8.378v-12.294h-12.294v9.428l-22.037,19.798h-7.539v6.779l-14.226,12.777h-0.151V70.709 C358.162,70.602,358.929,70.479,359.726,70.479z M517.449,340.078v6.225c-9.076,6.451-19.154,10.352-30.025,11.575v-2.036h-12.798 v2.137c-15.16-1.223-28.399-7.328-39.393-18.163c-10.981-10.813-17.329-23.896-18.871-38.909h1.706v-12.979h-1.759 c1.349-15.142,7.612-28.381,18.662-39.374c11.055-11.002,24.372-17.238,39.654-18.572v2.128h12.798v-1.892 c9.281,0.989,18.031,3.989,26.068,8.945c8.315,5.118,15.191,11.875,20.483,20.103h-17.523v-2.688h-8.157 c-6.1-4.746-13.106-7.746-20.871-8.942v-3.242h-12.798v2.94c-10.61,1.205-19.827,5.664-27.465,13.31 c-7.643,7.638-12.158,16.809-13.46,27.289h-3.16v12.974h3.197c1.412,10.383,6.021,19.381,13.727,26.803 c7.685,7.392,16.81,11.718,27.161,12.898v2.777h12.798v-3.044c11.349-1.628,20.897-6.926,28.431-15.77h6.509v-12.977h-12.798v2.86 H487.78v-2.86h-2.865v-12.296h2.865v-2.146h54.049v2.146h2.478c-0.021,4.379-0.078,13.239-0.153,26.574v26.751h-2.324v2.335h-11.58 v-14.881H517.449L517.449,340.078z M65.297,349.175c-11.53-0.311-22.783-3.838-28.368-7.354l4.549-20.206 c6.057,3.482,15.423,7.04,25.168,7.198c10.615,0.189,16.239-4.484,16.239-11.717c0-6.908-4.872-10.876-17.137-15.69 c-16.735-6.389-27.496-16.38-27.496-32.15c0-18.509,14.175-33.048,38.079-33.682c11.633-0.308,20.271,2.118,26.481,4.945 l-5.281,20.486c-4.176-2.092-11.577-5.103-21.646-4.935c-9.981,0.165-14.792,5.133-14.792,10.827 c0,6.998,5.72,10.045,18.911,15.368c18.307,7.202,27.032,17.499,27.032,33.285C107.03,334.324,93.505,349.926,65.297,349.175z M178.115,350.461l-29.302-0.756l-34.547-113.296l26.626-0.682l13.312,48.063c3.759,13.583,7.195,26.711,9.827,41.063l0.506,0.011 c2.801-13.797,6.268-27.454,10.101-40.646l14.394-49.723l27.614-0.703L178.115,350.461z M330.235,348.729 c-8.902,2.709-25.575,6.289-42.026,5.858c-22.363-0.6-38.289-6.51-49.25-17.354c-10.859-10.383-16.764-25.879-16.598-43.203 c0.178-39.203,28.795-62.355,68.778-63.392c16.115-0.425,28.683,2.354,34.908,5.124l-6.048,22.405 c-6.949-2.811-15.537-5.042-29.23-4.812c-23.142,0.376-40.326,13.418-40.326,39.278c0,24.631,15.567,39.424,38.299,39.812 c6.454,0.104,11.624-0.531,13.862-1.575v-25.544l-19.174-0.109v-21.384l46.806-0.164V348.729z"></path> </g> </g></svg>';
buttonSVG.style.display = 'none';
buttonSVG.setAttribute('title', 'Stiahnuť strom vo formáte SVG');

let buttonLaTeX = document.createElement('button');
buttonLaTeX.id = 'latex-tree-generate';
buttonLaTeX.innerHTML = '<svg fill="#094e86" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 585.918 585.918" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M357.396,535.335c0.776,0.053,1.542,0.115,2.329,0.115h177.39c20.756,0,37.627-16.888,37.627-37.628V86.602 c0-20.743-16.871-37.628-37.627-37.628h-177.39c-0.781,0-1.553,0.076-2.329,0.123V0L11.176,46.206v492.311l346.22,47.401V535.335z M357.396,70.717c0.766-0.113,1.532-0.241,2.329-0.241h177.39c8.893,0,16.125,7.236,16.125,16.126v411.22 c0,8.888-7.232,16.127-16.125,16.127h-177.39c-0.792,0-1.563-0.116-2.329-0.232V70.717z M118.282,258.927l-28.609,0.553v90.938 l-22.922-1.039v-89.453l-26.17,0.52v-20.57l77.701-2.71V258.927z M204.218,355.584l-72.954-3.297V236.714l70.46-2.457v22.48 l-45.32,0.908v24.429l42.659-0.143v22.267l-42.659-0.49v27.906l47.814,1.459V355.584z M290.702,359.501l-12.045-23.612 c-4.887-8.998-8.005-15.653-11.693-23.055h-0.375c-2.698,7.259-5.971,13.727-9.986,22.383l-10.612,22.258l-32.068-1.449 l36.035-61.66l-34.767-60.58l32.305-1.129l11.21,22.562c3.842,7.596,6.725,13.738,9.814,20.835l0.388-0.005 c3.1-8.113,5.638-13.8,8.96-21.217l11.25-23.625l35.35-1.231l-38.521,63.793l40.594,67.333L290.702,359.501z"></path> <path d="M498.006,358.997c0,1.88-0.135,3.506-0.409,4.913c-0.273,1.407-0.912,2.571-1.933,3.517 c-1.008,0.924-2.55,1.648-4.607,2.147c-2.08,0.52-4.888,0.771-8.479,0.771h-81.276v-14.972c0-6.004,1.387-10.541,4.158-13.626 c2.771-3.077,7.5-5.046,14.205-5.9v-1.755h-25.019v87.934h25.019v-2.929c-3.739-0.231-6.794-0.873-9.177-1.917 c-2.372-1.06-4.252-2.478-5.617-4.272c-1.364-1.796-2.299-3.921-2.803-6.378c-0.499-2.456-0.767-5.276-0.767-8.483v-12.746h81.271 c3.506,0,6.278,0.258,8.305,0.771c2.025,0.504,3.56,1.218,4.609,2.163c1.055,0.935,1.737,2.101,2.057,3.501 c0.305,1.397,0.462,3.041,0.462,4.913v3.732h2.919v-45.019h-2.919V358.997z"></path> <path d="M518.668,267.328c0.819,1.166,1.47,2.51,1.932,4.032c0.462,1.521,0.782,3.328,0.935,5.438 c0.158,2.104,0.231,4.672,0.231,7.72v18.006c0,2.258-0.116,3.979-0.346,5.145c-0.243,1.18-0.758,2.026-1.576,2.577 s-2.005,0.861-3.57,0.939c-1.563,0.084-3.662,0.104-6.319,0.104h-35.076v-23.26c0-3.436,0.263-6.16,0.771-8.187 c0.504-2.026,1.365-3.601,2.576-4.737c1.208-1.125,2.82-1.94,4.846-2.444c2.026-0.517,4.573-0.969,7.602-1.357v-2.929h-36.956 v2.919c2.656,0.157,4.956,0.475,6.894,0.937c1.953,0.473,3.548,1.31,4.802,2.52c1.255,1.21,2.185,2.866,2.81,4.965 c0.619,2.103,0.94,4.872,0.94,8.308v23.265H427.17v-29.115c0-3.58,0.18-6.52,0.53-8.83c0.353-2.302,1.155-4.189,2.399-5.672 c1.249-1.483,3.03-2.667,5.313-3.57c2.298-0.892,5.364-1.729,9.186-2.509v-1.872h-23.265v81.853h2.918v-3.732 c0-4.451,1.051-7.601,3.16-9.486c1.555-1.323,5.723-1.984,12.504-1.984h68.998c5.136,0,8.568,0.32,10.278,0.936 c0.945,0.319,1.755,0.859,2.457,1.642c0.703,0.776,1.271,1.659,1.7,2.625c0.432,0.987,0.756,2.016,0.998,3.104 c0.23,1.091,0.347,2.135,0.347,3.165v3.732h2.919v-81.847l-26.657-9.239v3.161c6.709,3.503,11.58,6.813,14.615,9.932 C516.82,264.914,517.859,266.15,518.668,267.328z"></path> <path d="M393.218,250.476c0.587-2.182,1.595-4.35,3.044-6.488c1.438-2.139,3.465-4.371,6.069-6.664 c2.609-2.302,6.026-4.893,10.231-7.78l30.636-20.923l31.69,25.016c2.719,2.18,5.154,4.283,7.297,6.32 c2.15,2.029,3.947,4.076,5.386,6.134c1.437,2.082,2.582,4.231,3.443,6.488c0.86,2.268,1.364,4.682,1.522,7.257h2.919v-37.649 h-2.919c-0.158,3.977-0.776,6.665-1.88,8.063c-1.081,1.407-2.446,2.113-4.083,2.113c-0.553,0-1.051-0.023-1.523-0.065 c-0.463-0.032-1.008-0.21-1.637-0.527c-0.62-0.315-1.397-0.796-2.348-1.458c-0.924-0.661-2.168-1.617-3.731-2.863l-28.532-22.331 l27.239-18.005c1.713-1.092,3.077-1.995,4.101-2.701c1.013-0.692,1.849-1.22,2.509-1.574c0.662-0.344,1.171-0.564,1.513-0.638 c0.352-0.086,0.735-0.113,1.112-0.113c2.268,0,4.022,0.683,5.267,2.047c1.238,1.365,1.903,4.186,1.983,8.473h2.919v-45.607h-2.919 c-0.085,2.415-0.368,4.497-0.883,6.247c-0.503,1.753-1.501,3.549-2.981,5.386c-1.479,1.83-3.633,3.822-6.487,5.961 c-2.846,2.141-6.679,4.85-11.517,8.118l-34.027,22.813l-27.014-21.05c-5.606-4.441-9.344-7.758-11.224-9.945 c-1.795-2.026-3.233-4.145-4.326-6.375c-1.091-2.215-1.753-5.124-1.984-8.714h-2.919v37.662h2.919 c0.158-4.209,0.631-7.16,1.397-8.832c0.787-1.682,2.309-2.522,4.567-2.522c0.629,0,1.175,0.042,1.637,0.124 c0.468,0.076,0.992,0.275,1.581,0.574c0.582,0.318,1.327,0.785,2.221,1.41c0.891,0.622,2.094,1.52,3.558,2.688l23.98,18.824 l-24.442,16.368c-3.664,2.501-6.477,3.735-8.414,3.735c-1.476,0-2.818-0.767-4.031-2.331c-1.213-1.553-1.896-4.399-2.048-8.538 h-2.919v49.116h2.919C392.263,255.077,392.629,252.665,393.218,250.476z"></path> </g> </g></svg>';
buttonLaTeX.style.display = 'none';
buttonLaTeX.setAttribute('title', 'LaTeX');

const modal = document.getElementById("myModal");
const btn = document.getElementById("help");
const span = document.getElementsByClassName("close")[0];

initializeMonacoEditor();

const editor = getEditor();
const model = getModel();

initControlButtons(editor);

function checkSyntax(input, isFormula) {
    monaco.editor.setModelMarkers(editor.getModel(), 'propositional-logic-language', []);

    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = '';

    function createStructuredFormula(lines) {
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

    if (input.includes('⊢')) {
        const relevantLine = input.split('\n').find(line => line.includes('⊢'));

        if (relevantLine) {
            const [premises, conclusion] = relevantLine.split('⊢');
            const premisesLines = premises.split(',').map(s => s.trim()).filter(s => s !== '');
            const formattedInput = [...premisesLines, '---------------', conclusion.trim()].join('\n');
            const lines = formattedInput.split('\n');
            return createStructuredFormula(lines);
        }
    } else if (isFormula) {
        return parseAndVisit(input, 0);
    } else {
        const lines = input.split('\n');
        return createStructuredFormula(lines);
    }
}

function parseAndVisit(input, lineNumberOffset) {
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

function applyResolution() {
    if (resolutionFound) {
        displayMessage("Riešenie sa už našlo. Ďalšie použitie pravidla rezolúcie nie je možné.", 'warning');
        return;
    }


    updateResolutionTable(initialClauses);
    clausesForEach = clausesForEach.filter(clause => clause.length > 0);

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


    clearTree("#dynamic-tree-container");
    clearTableResolutionInterpretation();
    clearTree("#tree-container");

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


        let tikzCode = buildTikzPicture(treeData);

        buttonLaTeX.onclick = function() {
            showModalWithText(tikzCode);
        };

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

function undo() {
    if (undoStack.length === 0) {
        displayMessage("Nie je možné vykonať krok späť.", 'error');
        return;
    }

    resolutionFound = false;
    clausesForEach.pop();
    const lastAction = undoStack.pop();
    redoStack.push(lastAction);
    let tempArray = Array.from(usedPairs);
    tempArray.pop();
    usedPairs = new Set(tempArray);
    steps.pop();
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

function closePopup() {
    document.getElementById("editing-buttons").style.display = "none";
    document.getElementById("editing-buttons").classList.add("hidden");
}

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

    if(!wasStrategyChanged) {

        logicalConsequence[logicalConsequence.length - 1] = logicalConsequence[logicalConsequence.length - 1].not();
    }

    for (let i = 0; i < logicalConsequence.length; i++) {
        logicalConsequence[i] = logicalConsequence[i].cnf();
    }

    let combinedCNFString = logicalConsequence.slice(0, -1)
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

function startProving() {
    const inputFormula = model.getValue();
    if (inputFormula !== lastInputTry || isNegationChecked !== lastIsChecked || wasStrategyChanged) {
        isProvingStarted = true;
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
        lastIsChecked = isNegationChecked;
        wasStrategyChanged = false;
    }
}

function formulaExplanation(explanation) {
    if (explanation.resolutionContainer.style.display === "block") {
        explanation.dotLines[0].style.visibility = 'visible';
        explanation.dotLines[1].style.visibility = 'visible';
    }
    let negFormula = formula;
    if (!isNegationChecked && !isDIMACS) {
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
            if (!isNegationChecked) {
                explanation.descCNF.innerHTML = "<strong>2. krokom</strong> je prevod formuly do <strong>CNF</strong>: ";
            } else {
                explanation.descCNF.innerHTML = "<strong>1. krok</strong> je prevod formuly do <strong>CNF</strong>: ";
            }

            explanation.CNFMessage.innerHTML = '$$\\top$$';
        } else {
            const latexCnfString = convertFormulasToLatex(simplifiedCnfFormula.toString());
            explanation.cnfResult.style.visibility = 'visible';
            if (!isNegationChecked) {
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
    if (!isNegationChecked) {
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
        }).catch(err => {
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

// LISTENERS

editor.onDidChangeModelContent((event) => {
    replaceText();
});

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

strategiesSelect.addEventListener('change', function() {
    isWithoutStrategy = this.value === 'without-strategy';
    isLinearResolution = this.value === 'linear-resolution';
    isUnitResolution = this.value === 'unit-resolution';

    if(isProvingStarted) {
        wasStrategyChanged = true;
    }
});

buttonDynamicSVG.addEventListener('click', function() {
    const svgElement = document.querySelector('#dynamic-tree-container svg');

    if (svgElement) {
        downloadSVG(svgElement, 'my-tree.svg');
    } else {
        displayMessage("Nebol vytvorený žiaden strom na stiahnutie.", 'error')
    }
});

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

document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('c1');

    isNegationChecked = checkbox.checked;

    checkbox.addEventListener('change', function() {
        isNegationChecked = checkbox.checked;
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

document.getElementById('toggleHistory').onclick = function() {
    const historyDiv = document.getElementById('history');
    if (historyDiv.style.right === '0px') {
        historyDiv.style.right = '-100%';
    } else {
        historyDiv.style.right = '0px';
    }
};

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

        if(isAnySteps) {
            buttonSVG.style.display = 'block';
            buttonLaTeX.style.display = 'block';
        } else {
            buttonSVG.style.display = 'none';
            buttonLaTeX.style.display = 'none';
        }

        buttonSVG.addEventListener('click', function() {
            const svgElement = document.querySelector('#tree-container svg');
            if (svgElement) {
                svgElement.style.display = 'block';
                svgElement.setAttribute('width', '350px');
                svgElement.setAttribute('height', '450px');
                downloadSVG(svgElement, 'my-tree.svg');
             }
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

document.getElementById("menuButton").addEventListener("click", function() {
    document.getElementById("editing-buttons").style.display = "block";
    document.getElementById("help").style.pointerEvents = "all";
    document.getElementById("dimacs").style.pointerEvents = "all";
    document.getElementById("fontSizeSelector").style.pointerEvents = "all";
    document.getElementById("pasteExampleSelector").style.pointerEvents = "all";
    document.getElementById("strategiesResolution").style.pointerEvents = "all";
    document.getElementById("openFile").style.pointerEvents = "all";
});

document.getElementById("menuButton").addEventListener("click", function() {
    let popup = document.getElementById("editing-buttons");
    popup.classList.remove("hidden");
    popup.classList.add("show");
});

document.getElementById("closeMenuButton").addEventListener("click", function() {
    let popup = document.getElementById("editing-buttons");
    popup.classList.remove("show");
});

document.addEventListener("click", function(event) {
    let popup = document.getElementById("editing-buttons");
    if (!popup.contains(event.target) && event.target !== document.getElementById("menuButton")) {
        popup.classList.add("hidden");
        popup.classList.remove("show");
    }
});

document.getElementById('openFile').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            editor.setValue(contents);
        };
        reader.readAsText(file);
    }
});

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

window.addEventListener('resize', function() {
    if (window.innerWidth <= 900) {
        document.getElementById('first-half').style.width = '';
        document.getElementById('second-half').style.width = '';
    }
    if (window.innerWidth > 900) {
        const firstHalf = document.getElementById('first-half');
        const divider = document.getElementById('divider');

        divider.style.left = `${firstHalf.offsetWidth}px`;

        editor.layout();
    }
    editor.layout();
});

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

document.getElementById('resolveButton').addEventListener('click', function() {
    startProving();
});

window.openTab = openTab;
window.closePopup = closePopup;
