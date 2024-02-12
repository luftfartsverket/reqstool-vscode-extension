// Copyright © LFV
import * as vscode from 'vscode'
import { AnnotationType } from './annotations/AnnotationType'
import Annotation from './annotations/Annotation'

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined
    private annotations: Annotation[]

    constructor(annotations: Annotation[]) {
        this.annotations = annotations
    }

    showWebview(html: string) {
        if (!this.panel) {
            // Create a new webview if it doesn't already exist
            this.panel = vscode.window.createWebviewPanel(
                'reqstoolDiver',
                'Additional Information',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                }
            )

            this.panel.onDidDispose(() => {
                this.panel = undefined
            })

            this.panel.webview.onDidReceiveMessage((message) => {
                const type = message.command as AnnotationType
                const html = this.annotations.find((item) => type === item.getAnnotationType())?.getHtml(message.text)
                if (!html) {
                    return
                }
                this.showWebview(html)
            }, undefined)
        }
        this.panel.webview.html = html
    }

    private static css = /*css*/ `
        .pills {
            list-style: none; 
            padding: 0; 
            display: flex; 
        }

        .pills li {
            background-color: var(--vscode-editor-lineHighlightBackground);
            border: 2px solid var(--vscode-editor-lineHighlightBorder);
            padding: 8px 16px; 
            border-radius: 4px; 
            margin-right: 8px;
        }
    `

    /**
     * Wraps the provided html in a base template. Meaning <html> <body> and a link event
     * handler enabling one way communication with the extension.
     *
     * To use the link handler, create <a> tags with the data attribute "data-urn" and no href.
     * */
    static wrapInBaseTemplate(html: string) {
        return /*html*/ `
            <html>
                <head>
                    <style>
                        ${this.css}
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        const vscode = acquireVsCodeApi();
                        const links = document.querySelectorAll('a[data-urn]') 
                        links.forEach(link => {
                            link.addEventListener('click', event => {
                                const type = event.target.getAttribute('data-annotation-type');
                                const urn = event.target.getAttribute('data-urn');
                                vscode.postMessage({
                                    command: type,
                                    text: urn
                                })
                            })
                        })
                    </script>
                </body>
            </html>
        `
    }
}
