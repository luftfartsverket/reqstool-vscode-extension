// Copyright © LFV

import * as vscode from 'vscode'
import { workspaceManager } from './WorkspaceManager'
import { AnnotationPosition } from './types'
import { languageAnnotationMap } from './languageAnnotationMap'
import { AnnotationType } from './enums/AnnotationType'

/**
 * Registers a hover provider for the given languages
 * @param languages
 * @returns a disposable that should be pushed to the context.subscriptions array of the activate function.
 */
export function registerHoverProvider(languages: string[]) {
    return vscode.languages.registerHoverProvider(languages, {
        provideHover(document, position, token) {
            const [id, type] = getAnnotionId(document, position)
            if (!id || !type) {
                return
            }

            const folder = vscode.workspace.getWorkspaceFolder(document.uri)
            if (!folder) {
                return
            }

            const markdown = workspaceManager.getByFolder(folder)?.getMarkdown(id, type)

            return new vscode.Hover(markdown ?? '?')
        },
    })
}

/**
 * Get the ID of requirement/SVC that is being hovered, if any.
 * @returns [id, annorationType]
 */
function getAnnotionId(document: vscode.TextDocument, hoverPosition: vscode.Position): [string?, AnnotationType?] {
    const line = document.lineAt(hoverPosition.line).text.trim()

    // Find if/where the requirements start and end
    const annotation = findAnnotation(line, document.languageId)
    if (!annotation.type) {
        return [undefined, undefined]
    }

    // Abort if the cursor is not within the requirements range
    if (hoverPosition.character < annotation.start && hoverPosition.character > annotation.end) {
        return [undefined, undefined]
    }

    const wordRange = document.getWordRangeAtPosition(hoverPosition, /"([^"]*)"/)
    if (!wordRange) {
        return [undefined, undefined]
    }
    // Any word within the selection at this point will be an ID wrapped in quotation marks.
    const id = document.getText(wordRange).slice(1, -1) // Slice away the quotation marks.

    return [id, annotation.type]
}

/**
 * Find the location of the annotation.
 * @returns Start and end index of the annoration parenthesis. Both values are -1 if the annotation isn't found.
 */
function findAnnotation(line: string, language: string): AnnotationPosition {
    // Find keywords
    const keywordIndex = {
        requirements: line.indexOf(languageAnnotationMap[language].requirements),
        svcs: line.indexOf(languageAnnotationMap[language].requirements),
    }

    // Find coordinates
    if (keywordIndex.requirements >= 0) {
        return {
            type: AnnotationType.requirement,
            ...findCoordinates(line, keywordIndex.requirements),
        }
    }

    if (keywordIndex.svcs >= 0) {
        return {
            type: AnnotationType.svc,
            ...findCoordinates(line, keywordIndex.svcs),
        }
    }

    return { start: -1, end: -1 }
}

/**
 * Finds the start and end index of section within parenthesis of an annoration.
 * @param line
 * @param keywordIndex where it starts looking
 */
function findCoordinates(line: string, keywordIndex: number) {
    line = line.substring(keywordIndex)
    return {
        start: line.indexOf('('),
        end: line.indexOf(')'),
    }
}
