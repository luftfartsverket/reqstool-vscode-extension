// Copyright © LFV
import * as vscode from 'vscode'
import Requirements from './annotations/Requirements'
import SoftwareVerificationCases from './annotations/SoftwareVerificationCases'
import Annotation from './annotations/Annotation'
import { dirRelevant, ensureTrailingSlash, processStdout } from './util'
import Relation from './Relation'
import { execute } from './childProcess'
import { ExecException, ExecOptions } from 'child_process'
import { WebviewProvider } from './WebViewProvider'
import ManualVerificationResults from './annotations/ManualVerificationResults'
import { HoverClickHandlerArgs } from './types'

const languages = ['java', 'python']

let annotations: Annotation[] = []

/**
 * Loads the directory path used to trigger the Requirements tool
 * @returns
 */
function loadEntryPoint() {
    const entryPoint: string = vscode.workspace.getConfiguration().get('reqstool.entryPointDir') ?? ''
    if (dirRelevant(entryPoint)) {
        return entryPoint
    }
    return undefined
}

/**
 * Vet the hover event and get the popup if a requirement is being hovered.
 * @returns A Hover or undefined
 */
async function handleHover(document: vscode.TextDocument, position: vscode.Position) {
    for (const annotation of annotations) {
        const id = annotation.getId(document, position)
        if (id === undefined) {
            continue
        }
        const info = await annotation.getMarkdown(id)
        if (!info) {
            return
        }
        return new vscode.Hover(info)
    }
}

/**
 * Reloads the entry point path and runs the Requirements tool
 */
async function reloadAndRunRequirementsTool() {
    const entryPoint = loadEntryPoint()
    if (!entryPoint) {
        return
    }
    const data = await runRequirementsTool(entryPoint)
    if (data) {
        annotations.forEach((x) => x.updateData(data))
    }
}

/**
 * Runs the Requirement tool on the entry point and updates the Annotation classes
 * @param entryPoint directory path
 */
async function runRequirementsTool(entryPoint: string) {
    const commandToRun = 'reqstool generate-json local -p .'
    const options: ExecOptions = {
        cwd: entryPoint, // Set command working directory
    }

    return await execute(commandToRun, options)
        .then(processStdout)
        .then((data) => {
            if (data != null) {
                vscode.window.showInformationMessage('Requirements data updated')
            }
            return data
        })
        .catch((error: ExecException) => {
            vscode.window.showErrorMessage(`Error executing command: ${error.message}`)
            return null
        })
}

function setupFileWatcher(entryPoint: string) {
    // Create watcher
    const fileWatcher = vscode.workspace.createFileSystemWatcher(ensureTrailingSlash(entryPoint) + '*.yml')

    // Event handler for file changes
    fileWatcher.onDidChange((uri) => {
        console.debug('File watcher triggered on', uri.scheme, uri.path)
        runRequirementsTool(entryPoint)
    })
}

/**
 * Called by VSCODE to activate the extension.
 * Control when it's activated using activationEvents in package.json
 */
export async function activate(context: vscode.ExtensionContext) {
    // Set up command to run requirements tool
    const runCommand = vscode.commands.registerCommand(
        'reqstool-vscode-extension.run-reqstool',
        reloadAndRunRequirementsTool
    )
    context.subscriptions.push(runCommand)

    // Load entry point and abort if it fails.
    const entryPoint = loadEntryPoint()
    if (!entryPoint) {
        return
    }

    // Run the Requirements tool when the extension activates and abort if it fails.
    const data = await runRequirementsTool(entryPoint)
    if (!data) {
        return
    }

    const relation = new Relation(data)
    annotations = [
        new Requirements('@Requirements', relation),
        new SoftwareVerificationCases('@SVCs', relation),
        new ManualVerificationResults('@MVRs', relation),
    ]
    annotations.forEach((x) => x.updateData(data))

    // Set up file watcher
    setupFileWatcher(entryPoint)

    //Set up hover
    const hover = vscode.languages.registerHoverProvider(languages, {
        provideHover(document, position, token) {
            if (!languages.includes(document.languageId)) {
                return
            }
            return handleHover(document, position)
        },
    })
    context.subscriptions.push(hover)

    const webviewProvider = new WebviewProvider(annotations)

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'reqstool-vscode-extension.hoverClickHandler',
            (args: HoverClickHandlerArgs) => {
                let output = /*html*/ `<h1 style="font-style: italic">No data<h1>`
                for (const annotationCategory of annotations) {
                    const html = annotationCategory.getHtml(args.urn)
                    if (!html) {
                        continue
                    }
                    output = html
                }
                webviewProvider.showWebview(output)
            }
        )
    )
}
