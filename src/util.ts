// Copyright © LFV
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { RequirementsToolOutput } from './types'

/**
 * Checks that the path is a valid directory with one or more .yml file in it.
 * @param dir
 */
export function dirRelevant(dir: string) {
    try {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            if (file.endsWith('.yml')) {
                return true
            }
        }
        vscode.window.showErrorMessage(
            `Issue with path *${dir}*. Please update the Requirements Tool vscode workspace settings.`
        )
        return false
    } catch (error) {
        vscode.window.showErrorMessage(
            `Issue with path *${dir}*. Please update the Requirements Tool vscode workspace settings.`
        )
        return false
    }
}

/**
 * Converts the stdout string to JSON
 */
export function processStdout(stdout: string): RequirementsToolOutput | null {
    // Trim extraneous bits by selecting the JSON line
    const rawJson = stdout.split('\n').filter((line) => line.startsWith('{'))[0]
    if (!rawJson) {
        vscode.window.showErrorMessage('Error reading output from Requirements tool.', stdout)
        return null
    }

    try {
        return JSON.parse(rawJson)
    } catch (e) {
        vscode.window.showErrorMessage('Error parsing JSON output from Requirements tool.', (e as Error).message)
        return null
    }
}

/**
 * @returns The directory path with a slash at the end
 * (or backslash depending on OS.)
 */
export function ensureTrailingSlash(dir: string) {
    if (!dir.endsWith(path.sep)) {
        return dir + path.sep
    }
    return dir
}

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
