// Copyright © LFV
import { MarkdownString } from 'vscode'
import Annotation from './Annotation'
import Relation from '../Relation'
import { WebviewProvider } from '../WebViewProvider'
import { AnnotationType } from './AnnotationType'
import { RequirementsMap, RequirementsToolOutput, Requirement } from '../types'

export default class Requirements extends Annotation {
    private requirements: RequirementsMap = {}

    updateData(json: RequirementsToolOutput) {
        this.urn = json.initial_model_urn
        this.requirements = json.requirements
    }

    getInfo(id: string) {
        if (!(id in this.requirements)) {
            return
        }
        return this.requirements[id]
    }

    getAnnotationType() {
        return AnnotationType.requirement
    }

    protected markdown(data: Requirement, relation: Relation) {
        const { id, title, significance, revision, description, rationale, categories } = data
        const lines = [
            `### ${title}`,
            `\`${id}\` \`${significance}\` \`${revision}\``,
            '---',
            `${description}`,
            '---',
            `${rationale}`,
            '---',
            categories.join(', '),
            '---',
            relation.svcsFromReq[id].map((svc) => this.linkUrnMarkdown(svc, AnnotationType.svc)).join(', '),
        ]
        const markdownText = new MarkdownString(lines.join('\n\n'))
        markdownText.isTrusted = true
        return markdownText
    }

    protected html(data: Requirement, relation: Relation) {
        const { id, title, significance, revision, description, rationale, categories } = data
        const categoryItems = categories.map((cat) => /*html*/ `<li>${cat}</li>`).join('\n')
        const linked = relation
            .getSvcsFromReq(id)
            .map((svc) => /*html*/ `<li>${this.linkUrnHtml(svc, AnnotationType.svc)}</li>`)
            .join('\n')
        return WebviewProvider.wrapInBaseTemplate(/*html*/ `
                <h1>Requirement</h1>
                <h2>${title}</h2>
                <ul class="pills">
                    <li>${id}</li>
                    <li>${significance}</li>
                    <li>${revision}</li>
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
}
