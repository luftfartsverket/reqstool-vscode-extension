// Copyright © LFV

import * as vscode from 'vscode'
import { AnnotationType } from './enums/AnnotationType'
import { languageAnnotationMap as keyword } from './languageAnnotationMap'
import { AnnotationId } from './types'

/**
 * Get the identifying properties of requirement/SVC that is being hovered, if any.
 */
export function getAnnotationId(
    document: vscode.TextDocument,
    hoverPosition: vscode.Position
): AnnotationId | undefined {
    const result = (idRange: vscode.Range, type: AnnotationType): AnnotationId => {
        const id = document.getText(idRangeMaybe).slice(1, -1) // Slice away the quotation marks.
        return { id, type }
    }

    // First check if what's being hovered is something within double quotes.
    const idRangeMaybe = document.getWordRangeAtPosition(hoverPosition, /"([^"]*)"/)
    if (!idRangeMaybe) {
        // Is not. Can't be what we're looking for.
        return undefined
    }

    // Search backwards for a start parenthesis
    const start = backtrack(document, idRangeMaybe.start)
    if (!start) {
        return undefined
    }
    // Get word before start of parenthesis
    const keywordRangeMaybe = document.getWordRangeAtPosition(start.translate(undefined, -3), /@[a-zA-Z]+/)

    // Check keyword against known keywords.
    // If the keyword matches then the idRangeMaybe can be assumed to be
    // an actual id.
    const keywordMaybe = document.getText(keywordRangeMaybe)
    if (keywordMaybe === keyword[document.languageId].requirements) {
        return result(idRangeMaybe, AnnotationType.requirement)
    }
    if (keywordMaybe === keyword[document.languageId].svcs) {
        return result(idRangeMaybe, AnnotationType.svc)
    }

    return undefined
}

/**
 * Find the opening parenthesis assuming that the "from" position is within parenthesis. No support for nested parenthesis.
 * @param fullLine Default false. Whether it should check the full line or start at the "from" position.
 * @returns Position of the opening parenthesis if found, otherwise undefined.
 * */
function backtrack(document: vscode.TextDocument, from: vscode.Position, fullLine = false) {
    const line = document.lineAt(from).text
    const start = fullLine ? line.length - 1 : from.character

    for (let i = start; i >= 0; i--) {
        const match = check(line[i])
        if (match === Match.Abort) {
            return undefined
        }
        if (match === Match.Yes) {
            return new vscode.Position(from.line, i)
        }
    }
    // Search previous line
    if (from.line === 0) {
        // Previous line can't exist
        return undefined
    }
    return backtrack(document, from.translate(-1), true)
}

/**
 * Result from check()
 */
enum Match {
    Yes,
    No,
    Abort,
}

/**
 * Checks if a character is the start of an annotation arguments parenthesis.
 */
function check(char: string) {
    if (char === '(') {
        return Match.Yes
    }
    // Checks that may help abort the search if we can be sure that we're not within parenthesis.
    if (char === ')' || char === '=') {
        return Match.Abort
    }
    return Match.No
}
