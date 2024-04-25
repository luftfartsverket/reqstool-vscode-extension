// Copyright © LFV

import * as vscode from 'vscode'
import { AnnotationType } from './enums/AnnotationType'
import { expandId, setupFileWatcher } from './util'
import { AnnotationId, RequirementsToolOutput } from './types'
import { keyFrom } from './WorkspaceManager'
import { Markdown } from './ui/Markdown'
import { HTML } from './ui/HTML'
import { URI } from 'vscode-uri'
import { runRequirementsTool } from './reqstool'
import { outputChannel } from './outputChannel'

export class ReqsWorkspace {
    workspaceFolder: vscode.WorkspaceFolder
    reqsDir: URI
    reqstoolData: RequirementsToolOutput
    disposeFileWatcher: () => any

    constructor(workspaceFolder: vscode.WorkspaceFolder, reqsDir: URI, reqstoolData: RequirementsToolOutput) {
        this.workspaceFolder = workspaceFolder
        this.reqsDir = reqsDir
        this.reqstoolData = reqstoolData
        const disposable = setupFileWatcher(reqsDir, this.handleFileChange)
        this.disposeFileWatcher = disposable.dispose
    }

    /**
     * Updates the requirements data stored in the class. Must be an arrow function to retain the reference to "this" when used as a callback.
     * @param uri The file that was changed.
     * @returns true if the data was updated. Does not account for whether it's different.
     */
    handleFileChange = async (uri: URI) => {
        outputChannel.appendLine(
            `${this.workspaceFolder.name}: Change detected in ${uri.fsPath.replace(
                this.workspaceFolder.uri.fsPath,
                ''
            )}.`
        )
        const data = await runRequirementsTool(this.reqsDir.fsPath)
        if (!data) {
            outputChannel.appendLine(`${this.workspaceFolder.name}: Failed to re-run reqstool.`)
            return false
        }
        this.reqstoolData = data
        outputChannel.appendLine(`${this.workspaceFolder.name}: Requirements reloaded.`)
        return true
    }

    getMarkdown(id: AnnotationId) {
        const urn = expandId(id.id, this.reqstoolData.initial_model_urn)
        const key = keyFrom(this.workspaceFolder)

        if (!this.urnExists(urn, id.type)) {
            return undefined
        }

        if (id.type === AnnotationType.requirement) {
            return Markdown.fromRequirement(urn, this.reqstoolData, key)
        }
        if (id.type === AnnotationType.svc) {
            return Markdown.fromSvc(urn, this.reqstoolData, key)
        }

        return undefined
    }

    getHtml(id: AnnotationId) {
        const urn = expandId(id.id, this.reqstoolData.initial_model_urn)
        const key = keyFrom(this.workspaceFolder)

        if (!this.urnExists(urn, id.type)) {
            return undefined
        }

        if (id.type === AnnotationType.requirement) {
            return HTML.fromRequirement(urn, this.reqstoolData, key)
        }
        if (id.type === AnnotationType.svc) {
            return HTML.fromSvc(urn, this.reqstoolData, key)
        }
        if (id.type === AnnotationType.mvr) {
            return HTML.fromMvr(urn, this.reqstoolData, key)
        }

        return undefined
    }

    urnExists(urn: string, type: AnnotationType) {
        switch (type) {
            case AnnotationType.requirement:
                return urn in this.reqstoolData.requirements
            case AnnotationType.svc:
                return urn in this.reqstoolData.svcs
            case AnnotationType.mvr:
                return urn in this.reqstoolData.mvrs
        }
    }
}
