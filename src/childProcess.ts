// Copyright © LFV
/**
 * This is a wrapper for the nodejs child_process.exec function,
 * allowing it to be used as a promise with typing.
 */

import { exec, ExecOptions } from 'child_process'

export function execute(command: string, options: ExecOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })
}
