// Copyright © LFV
import { describe, expect, test } from '@jest/globals'
import { ensureTrailingSlash, processStdout } from '../util'
import * as path from 'path'

describe('Process data from the Requirements tool', () => {
    test('Handle ok input data', () => {
        const returnValue = processStdout(['VALIDATION: PASS', '', '{ "version": "0.0.1" }'].join('\n'))
        const expectedReturnValue = {
            version: '0.0.1',
        }
        expect(returnValue).toMatchObject(expectedReturnValue)
    })

    test('Handle erroneous input data', () => {
        const returnValue = processStdout('')
        expect(returnValue).toBeNull()
    })
})

test('Ensure trailing slash', () => {
    expect(ensureTrailingSlash('test')).toBe('test' + path.sep)
})
