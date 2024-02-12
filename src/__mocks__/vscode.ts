// Copyright © LFV
// Mock the vscode API. Jest will tell you which keys are missing, and you can add them here.
const vscode = {
    window: {
        showErrorMessage: (message: string, ...items: string[]) => {},
    },
}

module.exports = vscode
