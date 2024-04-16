// Copyright © LFV

import { RequirementsToolOutput } from '../types'
import { AnnotationType } from '../enums/AnnotationType'
import { stringifyRevision } from '../util'

export namespace HTML {
    export function fromRequirement(urn: string, reqstoolData: RequirementsToolOutput, workspaceKey: string) {
        const { id, title, significance, revision, description, rationale, categories } = reqstoolData.requirements[urn]
        const categoryItems = categories.map((cat) => /*html*/ `<li>${cat}</li>`).join('\n')
        const linked = reqstoolData.svcs_from_req[id]
            .map((svc) => /*html*/ `<li>${link(svc, AnnotationType.svc, workspaceKey)}</li>`)
            .join('\n')
        return wrapInBaseTemplate(/*html*/ `
            <h1>Requirement</h1>
            <h2>${title}</h2>
            <ul class="pills">
                <li>${id}</li>
                <li>${significance}</li>
                <li>${stringifyRevision(revision)}</li>
            </ul>
            <h3>Description</h3>
            <p>${description}</p>
            <h3>Rationale</h3>
            <p>${rationale}</p>
            <h3>Categories</h3>
            <ul>${categoryItems}</ul>
            <h3>Related SVCs</h3>
            <ul>${linked}</ul>
        `)
    }

    export function fromSvc(urn: string, reqstoolData: RequirementsToolOutput, workspaceKey: string) {
        const { id, title, description, verification, instructions, revision, requirement_ids } = reqstoolData.svcs[urn]
        const reqIds = requirement_ids
            .map((req) => /*html*/ `<li>${link(req, AnnotationType.requirement, workspaceKey)}</li>`)
            .join('\n')
        const relatedMvrs = reqstoolData.mvrs_from_svc[id]
            .map((mvr) => /*html*/ `<li>${link(mvr, AnnotationType.mvr, workspaceKey)}</li>`)
            .join('\n')

        return wrapInBaseTemplate(/*html*/ `
            <h1>Software Verification Case</h1>
            <h2>${title}</h2>
            <ul class="pills">
                <li>${id}</li>
                <li>${stringifyRevision(revision)}</li>
            </ul>
            <h3>Description</h3>
            <p>${description}</p>
            <h3>Verification</h3>
            <p>${verification}</p>
            <h3>Instructions</h3>
            <p>${instructions}</p>
            <h3>Requirements</h3>
            <ul>${reqIds}</ul>
            <h3>Related MVRs</h3>
            <ul>${relatedMvrs}</ul>
        `)
    }

    export function fromMvr(urn: string, reqstoolData: RequirementsToolOutput, workspaceKey: string) {
        const { id, comment, passed, svc_ids } = reqstoolData.mvrs[urn]
        const svcIds = svc_ids
            .map((svc) => /*html*/ `<li>${link(svc, AnnotationType.svc, workspaceKey)}</li>`)
            .join('\n')
        const commentText = comment ? `<p>${comment}</p>` : ''

        return wrapInBaseTemplate(/*html*/ `
            <h1>MVR ${id}</h1>
            <p>${passed ? '✔️ Passed' : '❌ Failed'}</p>
            ${commentText}
            <h3>Related SVCs</h3>
            <ul>${svcIds}</ul>
        `)
    }

    /**
     * Creates a HTML link that has the correct properties to be handled by the webview base template link event handler
     * @param urn
     * @param annotationType
     * @param workspaceKey
     * @returns
     */
    export function link(urn: string, annotationType: AnnotationType, workspaceKey: string) {
        return /*html*/ `<a href="#${annotationType.toString()}?urn=${urn}" data-annotation-type="${annotationType.toString()}" data-urn="${urn}" data-workspace="${workspaceKey}">${urn}</a>`
    }

    /**
     * Wraps the provided html in a base template. Meaning <html> <body> and a link event
     * handler enabling one-way communication with the extension.
     *
     * To use the link handler, create <a> tags with the data attribute "data-urn", "data-annotation-type", "data-workspace" and # for href.
     * */
    export function wrapInBaseTemplate(html: string) {
        return /*html*/ `
            <html>
                <head>
                    <style>
                        ${css}
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        const vscode = acquireVsCodeApi();
                        const links = document.querySelectorAll('a[data-urn]') 
                        links.forEach(link => {
                            link.addEventListener('click', event => {
                                const urn = event.target.getAttribute('data-urn')
                                const type = event.target.getAttribute('data-annotation-type')
                                const workspaceKey = event.target.getAttribute('data-workspace')
                                vscode.postMessage({
                                    urn,
                                    type,
                                    workspaceKey,
                                })
                            })
                        })
                    </script>
                </body>
            </html>
        `
    }

    export function fallback(urn?: string) {
        const text = urn ? 'No data for ' + urn : 'No data'
        return wrapInBaseTemplate(/*html*/ `<h1 style="font-style: italic">${text}<h1>`)
    }

    const css = /*css*/ `
        .pills {
            list-style: none; 
            padding: 0; 
            display: flex; 
        }

        .pills li {
            background-color: var(--vscode-editor-lineHighlightBackground);
            border: 2px solid var(--vscode-editor-lineHighlightBorder);
            padding: 8px 16px; 
            border-radius: 4px; 
            margin-right: 8px;
        }
    `
}
