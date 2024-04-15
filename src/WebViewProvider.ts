// Copyright © LFV

import * as vscode from 'vscode'

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined
    private handleWebViewMessage: (message: any) => void

    constructor(handleWebViewMessage: (message: any) => void) {
        this.handleWebViewMessage = handleWebViewMessage
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

            this.panel.webview.onDidReceiveMessage(this.handleWebViewMessage, undefined)
        }
        this.panel.webview.html = html
    }
}
