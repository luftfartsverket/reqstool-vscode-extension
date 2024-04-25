// Copyright © LFV

import * as vscode from 'vscode'
import { workspaceManager } from './WorkspaceManager'
import { getAnnotionId } from './annotations'

/**
 * Registers a hover provider for the given languages
 * @param languages
 * @returns a disposable that should be pushed to the context.subscriptions array of the activate function.
 */
export function registerHoverProvider(languages: string[]) {
    return vscode.languages.registerHoverProvider(languages, {
        provideHover(document, position, token) {
            const annotation = getAnnotionId(document, position)
            if (!annotation) {
                return
            }

            const folder = vscode.workspace.getWorkspaceFolder(document.uri)
            if (!folder) {
                return
            }

            const markdown = workspaceManager
                .getByFolder(folder)
                ?.getMarkdown({ id: annotation.id, type: annotation.type })

            return new vscode.Hover(markdown ?? '?')
        },
    })
}
