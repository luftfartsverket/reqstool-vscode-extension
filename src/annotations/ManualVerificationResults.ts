// Copyright © LFV
import { MarkdownString } from 'vscode'
import Annotation from './Annotation'
import Relation from '../Relation'
import { WebviewProvider } from '../WebViewProvider'
import { AnnotationType } from './AnnotationType'
import { MVRsMap, RequirementsToolOutput, ManualVerificationResult } from '../types'

export default class ManualVerificationResults extends Annotation {
    private MVRs: MVRsMap = {}

    updateData(json: RequirementsToolOutput) {
        this.urn = json.initial_model_urn
        this.MVRs = json.mvrs
    }

    getInfo(id: string) {
        if (!(id in this.MVRs)) {
            return
        }
        return this.MVRs[id]
    }

    getAnnotationType() {
        return AnnotationType.mvr
    }

    protected markdown(data: ManualVerificationResult, relation: Relation) {
        const { id, comment, passed, svc_ids } = data
        const lines = [
            `### MVR ${id}`,
            passed ? '✔️ Passed' : '❌ Failed',
            '---',
            comment,
            '---',
            svc_ids.map((svc) => this.linkUrnMarkdown(svc, AnnotationType.mvr)).join(', '),
        ]
        const markdownText = new MarkdownString(lines.join('\n\n'))
        markdownText.isTrusted = true
        return markdownText
    }

    protected html(data: ManualVerificationResult, relation: Relation) {
        const { id, comment, passed, svc_ids } = data
        const svcIds = svc_ids.map((svc) => /*html*/ `<li>${this.linkUrnHtml(svc, AnnotationType.mvr)}</li>`).join('\n')

        return WebviewProvider.wrapInBaseTemplate(/*html*/ `
            <h1>MVR ${id}</h1>
            <p>${passed ? '✔️ Passed' : '❌ Failed'}</p>
            <p>${comment}</p>
            <h3>Related SVCs</h3>
            <ul>${svcIds}</ul>
        `)
    }
}
