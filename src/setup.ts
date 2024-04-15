// Copyright © LFV

import * as vscode from 'vscode'
import { URI, Utils } from 'vscode-uri'
import { outputChannel } from './outputChannel'
import { workspaceManager } from './WorkspaceManager'
import { runRequirementsTool } from './reqstool'
import { ReqsWorkspace } from './ReqsWorkspace'

/**
 * Finds all workspaces with a requirements.yml file in a reqstool folder and sends them to setupProject()
 */
export function scanWorkspaceFolders() {
    if (vscode.workspace.workspaceFolders === undefined) {
        console.debug('No workspace folders are open.')
        return
    }
    for (const folder of vscode.workspace.workspaceFolders) {
        getReqsDir(folder).then((reqsDir) => {
            if (!reqsDir) {
                return
            }
            setupProject(folder, reqsDir)
        })
    }
}

/**
 * Find the requirements folder in a workspace.
 * @returns the workspace URI if it exists, otherwise undefined.
 */
export function getReqsDir(folder: vscode.WorkspaceFolder) {
    const searchPattern = new vscode.RelativePattern(folder, '**/requirements.yml')
    const result = vscode.workspace.findFiles(searchPattern).then((result) => {
        if (result.length === 0) {
            return undefined
        }
        return Utils.dirname(result[0])
    })
    return result
}

/**
 * Runs reqstool on a workspace and registers it in the reqsWorkspace
 */
export async function setupProject(workspaceFolder: vscode.WorkspaceFolder, reqsDir: URI) {
    const data = await runRequirementsTool(reqsDir.fsPath)
    if (data === null) {
        outputChannel.appendLine(`Workspace folder '${workspaceFolder.name}' failed to initialize.`)
        return
    }

    workspaceManager.set(workspaceFolder, new ReqsWorkspace(workspaceFolder, reqsDir, data))
    outputChannel.appendLine(`Workspace folder '${workspaceFolder.name}' ready for use with reqstool.`)
}
