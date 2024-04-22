// Copyright © LFV

import * as vscode from 'vscode'
import { getReqsDir, scanWorkspaceFolders, setupProject } from './setup'
import { outputChannel } from './outputChannel'
import { HoverClickHandlerArgs } from './types'
import { workspaceManager } from './WorkspaceManager'
import { WebviewProvider } from './WebViewProvider'
import { AnnotationType } from './enums/AnnotationType'
import { languageAnnotationMap } from './languageAnnotationMap'
import { registerHoverProvider } from './hoverProvider'
import { HTML } from './ui/HTML'
import { registerSnippets } from './snippets'

const webView = new WebviewProvider(handleWebViewMessage)

export function activate(context: vscode.ExtensionContext) {
    console.debug('"vscode-workspace-testing" is now activating.')

    // Register hover provider
    const languages = Object.keys(languageAnnotationMap)
    context.subscriptions.push(registerHoverProvider(languages))

    // Register event listener to handle workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders(handleWorkspaceFoldersChange)

    // Register command used by the links within hover popups
    context.subscriptions.push(
        vscode.commands.registerCommand('reqstool-vscode-extension.hoverClickHandler', handleHoverClick)
    )

    // Register autocomplete snippets
    context.subscriptions.push(registerSnippets())

    // Setup all open workspaces on extension lauch
    scanWorkspaceFolders()
}

export function deactivate() {
    outputChannel.appendLine('Deactivating reqstool extension.')
}

function handleWebViewMessage(message: any) {
    const type = message.type as AnnotationType
    const html = workspaceManager.getByKey(message.workspaceKey)?.getHtml(message.urn, type)
    webView.showWebview(html ?? HTML.fallback(message.urn))
}

function handleHoverClick(args: HoverClickHandlerArgs) {
    const html = workspaceManager.getByKey(args.workspaceKey)?.getHtml(args.urn, args.type)
    webView.showWebview(html ?? HTML.fallback(args.urn))
}

function handleWorkspaceFoldersChange(event: vscode.WorkspaceFoldersChangeEvent) {
    event.added.forEach((added) =>
        getReqsDir(added).then((reqsDir) => {
            if (!reqsDir) {
                return
            }
            setupProject(added, reqsDir)
        })
    )

    event.removed.forEach((removed) => {
        if (workspaceManager.remove(removed)) {
            outputChannel.appendLine(`Workspace folder '${removed.name}' unregistered.`)
        }
    })
}
