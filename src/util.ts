// Copyright © LFV

import path from 'path'
import * as vscode from 'vscode'
import { URI } from 'vscode-uri'
import { Revision } from './types'

/**
 * Makes sure the id is a complete urn. Adds the defaultBaseUrn if the id is incomplete.
 * Does nothing to a complete urn.
 */
export function expandId(id: string, defaultBaseUrn: string) {
    if (!id.includes(':')) {
        return `${defaultBaseUrn}:${id}`
    }
    return id
}

export function setupFileWatcher(reqsDir: URI, handleChange: (uri: URI) => void) {
    // Match all .yml files in the reqstool folder
    const globPattern = reqsDir.fsPath + path.sep + '*.yml'
    const fileWatcher = vscode.workspace.createFileSystemWatcher(globPattern)

    // Event handler
    fileWatcher.onDidChange(handleChange)

    return new vscode.Disposable(fileWatcher.dispose)
}

export function stringifyRevision(revision: Revision) {
    return `${revision.major}.${revision.minor}.${revision.patch}`
}
