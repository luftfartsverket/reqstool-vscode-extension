// Copyright © LFV

import * as vscode from 'vscode'
import { ExecException, ExecOptions } from 'node:child_process'
import { execute } from './childProcess'
import { outputChannel } from './outputChannel'
import { RequirementsToolOutput } from './types'

/**
 * Runs the Requirement tool on the reqstool folder
 * @param reqsDir directory path to requirements
 */
export function runRequirementsTool(reqsDir: string) {
    const commandToRun = 'reqstool generate-json local -p .'
    const options: ExecOptions = {
        cwd: reqsDir, // Set command working directory
    }

    return execute(commandToRun, options)
        .then(processStdout)
        .then((data) => {
            return data
        })
        .catch((error: ExecException) => {
            vscode.window.showErrorMessage(`Error running reqstool in '${reqsDir}'. See extension output for details.`)
            outputChannel.appendLine(`Error running reqstool in '${reqsDir}'`)
            outputChannel.appendLine('Message:')
            outputChannel.appendLine(error.message)
            outputChannel.show()
            return null
        })
}

/**
 * Converts the stdout string to JSON
 */
function processStdout(stdout: string): RequirementsToolOutput | null {
    // Trim extraneous bits by selecting the JSON line
    const rawJson = stdout.split('\n').filter((line) => line.startsWith('{'))[0]
    if (!rawJson) {
        outputChannel.appendLine('Error reading output from Requirements tool. Output contains:')
        outputChannel.appendLine(stdout)
        return null
    }

    try {
        let output: RequirementsToolOutput = JSON.parse(rawJson)
        return output
    } catch (e) {
        vscode.window.showErrorMessage('Error parsing JSON output from Requirements tool.', (e as Error).message)
        return null
    }
}
