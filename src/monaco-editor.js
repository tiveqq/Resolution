import * as monaco from "monaco-editor";
export { monaco };

let editor;

export const getModel = () => {
    if (!editor) {
        return null;
    }
    return editor.getModel();
};

export const getEditor = () => {
    if (!editor) {
        return null;
    }
    return editor;
};

export function displayError(message, line, column, offendingSymbol) {
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

    const resolveButton = document.getElementById('resolveButton');
    resolveButton.disabled = true;
}



export function initializeMonacoEditor() {
    // Creating Monaco editor
    const editorOptions = {
        value: '',
        language: 'propositional-logic-language',
        fontSize: 18,
        renderLineHighlight: 'line'
    };
    monaco.languages.register({ id: 'propositional-logic-language' });
    editor = monaco.editor.create(document.getElementById('monaco-editor'), editorOptions);

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

    function getRange(position) {
        return {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - 1,
            endColumn: position.column
        };
    }


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


}
