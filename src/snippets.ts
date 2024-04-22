// Copyright © LFV

import * as vscode from 'vscode'

const snippets = [
    {
        label: 'Requirement YAML block',
        insertText: new vscode.SnippetString(
            [
                '- id:',
                '  title: ',
                '  description: ',
                '  rationale: ',
                '  significance: ',
                '  categories: ',
                '  references: ',
                '    requirement_ids: ',
                '  revision: 0.0.1',
            ].join('\n')
        ),
        kind: vscode.CompletionItemKind.Snippet,
        detail: 'Inserts an empty Requirement YAML block',
    },
    {
        label: 'SVC YAML block',
        insertText: new vscode.SnippetString(
            [
                '- id:',
                '  title: ',
                '  requirement_ids: ',
                '  description: ',
                '  verification: ',
                '  instructions: ',
                '  revision: 0.0.1',
            ].join('\n')
        ),
        kind: vscode.CompletionItemKind.Snippet,
        detail: 'Inserts an empty software verification case YAML block',
    },
    {
        label: 'MVR YAML block',
        insertText: new vscode.SnippetString(['- id:', '  svc_ids: ', '  comment: ', '  pass: '].join('\n')),
        kind: vscode.CompletionItemKind.Snippet,
        detail: 'Inserts an empty manual verification results YAML block',
    },
]

/**
 * Adds autocomplete snippets to YAML files
 * @returns a disposable that should be pushed to the context.subscriptions of the activate function.
 */
export function registerSnippets() {
    return vscode.languages.registerCompletionItemProvider(
        { language: 'yaml' },
        {
            provideCompletionItems(document, position, token, context) {
                return snippets.map((snippet) => {
                    const item = new vscode.CompletionItem(snippet.label, snippet.kind)
                    item.insertText = snippet.insertText
                    item.documentation = new vscode.MarkdownString(snippet.detail)
                    return item
                })
            },
        }
    )
}
