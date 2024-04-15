// Copyright © LFV

import * as vscode from 'vscode'
import { AnnotationType } from './enums/AnnotationType'
import { expandId, setupFileWatcher } from './util'
import { RequirementsToolOutput } from './types'
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

    getMarkdown(urn: string, type: AnnotationType) {
        urn = expandId(urn, this.reqstoolData.initial_model_urn)
        const key = keyFrom(this.workspaceFolder)

        if (type === AnnotationType.requirement) {
            return Markdown.fromRequirement(urn, this.reqstoolData, key)
        }
        if (type === AnnotationType.svc) {
            return Markdown.fromSvc(urn, this.reqstoolData, key)
        }

        return undefined
    }

    getHtml(urn: string, type: AnnotationType) {
        urn = expandId(urn, this.reqstoolData.initial_model_urn)
        const key = keyFrom(this.workspaceFolder)

        if (type === AnnotationType.requirement) {
            return HTML.fromRequirement(urn, this.reqstoolData, key)
        }
        if (type === AnnotationType.svc) {
            return HTML.fromSvc(urn, this.reqstoolData, key)
        }
        if (type === AnnotationType.mvr) {
            return HTML.fromMvr(urn, this.reqstoolData, key)
        }

        return undefined
    }
}
