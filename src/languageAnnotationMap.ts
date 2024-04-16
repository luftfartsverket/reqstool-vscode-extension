// Copyright © LFV

type LanguageAnnotationMap = {
    [key: string]: {
        requirements: string
        svcs: string
    }
}

/**
 * Map containing the supported languages and their annotation format.
 * The keys of this map needs to be the same as what the vscodeHoverProvider calls the languages.
 */
export const languageAnnotationMap: LanguageAnnotationMap = {
    java: {
        requirements: '@Requirements',
        svcs: '@SVCs',
    },
    python: {
        requirements: '@Requirements',
        svcs: '@SVCs',
    },
}
