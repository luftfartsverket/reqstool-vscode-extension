// Copyright © LFV
import * as vscode from 'vscode'
import Relation from '../Relation'
import { expandId } from '../util'
import { AnnotationType } from './AnnotationType'
import {
    HoverClickHandlerArgs,
    ManualVerificationResult,
    Requirement,
    RequirementsToolOutput,
    SoftwareVerificationCase,
} from '../types'

export default abstract class Annotation {
    initiatorText: string
    protected urn = ''
    protected relation: Relation

    constructor(initiatorText: string, relation: Relation) {
        this.initiatorText = initiatorText
        this.relation = relation
    }

    /**
     * A string representing the annotation type. Requirement, SVC etc..
     * Used in messaging between sandboxed parts of the extension.
     */
    abstract getAnnotationType(): AnnotationType

    /**
     * Grabs the relevant portion of the requirements tool output and keeps it
     * in order to respond to getInfo.
     */
    abstract updateData(json: RequirementsToolOutput): void

    /**
     * Searches the list of requirements/SVCs for the id.
     * @param id The same as you'll find in the .yml file.
     * @returns Undefined if nothing was found, or the requirement/SVC depending on subclass.
     */
    abstract getInfo(id: string): Requirement | SoftwareVerificationCase | ManualVerificationResult | undefined

    protected abstract markdown(
        data: Requirement | SoftwareVerificationCase | ManualVerificationResult,
        relation: Relation
    ): vscode.MarkdownString
    protected abstract html(
        data: Requirement | SoftwareVerificationCase | ManualVerificationResult,
        relation: Relation
    ): string

    /**
     * @returns A promises that resolves to undefined if the ID is not found,
     * or a markdown string that can be used by VSCode's hover feature.
     */
    getMarkdown(id: string) {
        const data = this.getInfo(id)
        if (!data) {
            return
        }
        return this.markdown(data, this.relation)
    }

    getHtml(id: string) {
        const data = this.getInfo(id)
        if (!data) {
            return
        }
        const output = this.html(data, this.relation)
        return output
    }

    /**
     * Get the ID of requirement/SVC that is being hovered, if any.
     */
    getId(document: vscode.TextDocument, hoverPosition: vscode.Position) {
        const line = document.lineAt(hoverPosition.line).text.trim()

        // Find if where the requirements start and end
        const annotationsPosition = this.findAnnotations(line)
        if (annotationsPosition.start === -1) {
            return
        }

        // Abort if the cursor is not within the requirements range
        if (hoverPosition.character < annotationsPosition.start && hoverPosition.character > annotationsPosition.end) {
            return
        }

        const wordRange = document.getWordRangeAtPosition(hoverPosition, /"([^"]*)"/)
        if (!wordRange) {
            return
        }
        // Any word within the selection at this point will be an ID wrapped in quotation marks.
        const id = document.getText(wordRange).slice(1, -1) // Slice away the quotation marks.

        return expandId(id, this.urn)
    }

    /**
     * Find the location of the Requirements annotation.
     * @returns Start and end index of the requirements parenthesis. Both values are -1 if the annotation isn't found.
     */
    private findAnnotations(line: string) {
        const index = line.indexOf(this.initiatorText)
        if (index < 0) {
            return { start: -1, end: -1 }
        }
        line = line.substring(index)
        return {
            start: line.indexOf('('),
            end: line.indexOf(')'),
        }
    }

    private encodeUrn(urn: string, annotationType: AnnotationType) {
        const data: HoverClickHandlerArgs = { urn, annotationType }
        return encodeURIComponent(JSON.stringify(data))
    }

    protected linkUrnMarkdown(urn: string, annotationType: AnnotationType) {
        return `[${urn}](command:reqstool-vscode-extension.hoverClickHandler?${this.encodeUrn(urn, annotationType)})`
    }

    protected linkUrnHtml(urn: string, annotationType: AnnotationType) {
        return /*html*/ `<a href="#${annotationType.toString()}?urn=${urn}" data-annotation-type="${annotationType.toString()}" data-urn="${urn}">${urn}</a>`
    }
}
