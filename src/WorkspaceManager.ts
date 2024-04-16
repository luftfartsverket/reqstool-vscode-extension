// Copyright © LFV

import * as vscode from 'vscode'
import { ReqsWorkspace } from './ReqsWorkspace'

class WorkspaceManager {
    private reqsWorkspaces = new Map<string, ReqsWorkspace>()

    getByFolder(workspaceFolder: vscode.WorkspaceFolder) {
        return this.reqsWorkspaces.get(keyFrom(workspaceFolder))
    }

    getByKey(workspaceKey: string) {
        return this.reqsWorkspaces.get(workspaceKey)
    }

    set(workspaceFolder: vscode.WorkspaceFolder, reqsWorkspace: ReqsWorkspace) {
        this.reqsWorkspaces.set(keyFrom(workspaceFolder), reqsWorkspace)
    }

    remove(workspaceFolder: vscode.WorkspaceFolder) {
        const key = keyFrom(workspaceFolder)
        if (!this.reqsWorkspaces.has(key)) {
            // Not existing in the first place fullfills the goal of "this shall not be".
            return true
        }
        this.reqsWorkspaces.get(key)?.disposeFileWatcher()
        return this.reqsWorkspaces.delete(key)
    }
}

/**
 * @returns the value used as key for a workspace internally in the the WorkspaceManager.
 */
export function keyFrom(workspaceFolder: vscode.WorkspaceFolder) {
    return workspaceFolder.uri.fsPath
}

// Create and make workspaceManager accessible elsewhere
export const workspaceManager = new WorkspaceManager()
