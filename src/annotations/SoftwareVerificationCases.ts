// Copyright © LFV
import { MarkdownString } from 'vscode'
import Annotation from './Annotation'
import Relation from '../Relation'
import { WebviewProvider } from '../WebViewProvider'
import { AnnotationType } from './AnnotationType'
import { SVCsMap, RequirementsToolOutput, SoftwareVerificationCase } from '../types'

export default class SoftwareVerificationCases extends Annotation {
    private SVCs: SVCsMap = {}

    updateData(json: RequirementsToolOutput) {
        this.urn = json.initial_model_urn
        this.SVCs = json.svcs
    }

    getInfo(id: string) {
        if (!(id in this.SVCs)) {
            return
        }
        return this.SVCs[id]
    }

    getAnnotationType() {
        return AnnotationType.svc
    }

    protected markdown(data: SoftwareVerificationCase, relation: Relation) {
        const { id, title, description, verification, instructions, revision, requirement_ids } = data
        const lines = [
            `### ${title}`,
            `\`${id}\` \`${verification}\` \`${revision}\``,
            '---',
            description,
            '---',
            instructions,
            '---',
            requirement_ids.map((req) => this.linkUrnMarkdown(req, AnnotationType.requirement)).join(', '),
            '---',
            relation
                .getMvrsFromSvc(id)
                .map((svc) => this.linkUrnMarkdown(svc, AnnotationType.svc))
                .join(', '),
        ]
        //return
        const markdownText = new MarkdownString(lines.join('\n\n'))
        markdownText.isTrusted = true
        return markdownText
    }

    protected html(data: SoftwareVerificationCase, relation: Relation) {
        const { id, title, description, verification, instructions, revision, requirement_ids } = data
        const reqIds = requirement_ids
            .map((req) => /*html*/ `<li>${this.linkUrnHtml(req, AnnotationType.requirement)}</li>`)
            .join('\n')
        const linked = relation
            .getMvrsFromSvc(id)
            .map((svc) => /*html*/ `<li>${this.linkUrnHtml(svc, AnnotationType.svc)}</li>`)
            .join('\n')

        return WebviewProvider.wrapInBaseTemplate(/*html*/ `
            <h1>Software Verification Case</h1>
            <h2>${title}</h2>
            <ul class="pills">
                <li>${id}</li>
                <li>${revision}</li>
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
            <ul>${linked}</ul>
        `)
    }
}
