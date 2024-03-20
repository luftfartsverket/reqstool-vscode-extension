// Copyright © LFV

import { AnnotationType } from './annotations/AnnotationType'

/**
 * This definition is simplified. Some of these are enums but keeping
 * track of that is unnecessary when only displaying the data.
 */
export type Requirement = {
    id: string
    title: string
    significance: string
    description: string
    rationale: string
    revision: string
    categories: string[]
    references: string[]
}

export type SoftwareVerificationCase = {
    id: string
    title: string
    description: string | null
    verification: string
    instructions: string | null
    revision: string
    requirement_ids: string[]
}

export type ManualVerificationResult = {
    id: string
    comment: string
    passed: boolean
    svc_ids: string[]
}

/**
 * This definition is simplified. It only contains the properties
 * used in this extension.
 *
 * The initial_model_urn is used as the key for the models.
 */
export type RequirementsToolOutput = {
    initial_model_urn: string
    requirements: RequirementsMap
    svcs: SVCsMap
    mvrs: MVRsMap
    reqs_from_urn: StringArrayMap
    svcs_from_urn: StringArrayMap
    svcs_from_req: StringArrayMap
    mvrs_from_urn: StringArrayMap
    mvrs_from_svc: StringArrayMap
}

export type RequirementsMap = {
    [key: string]: Requirement
}

export type SVCsMap = {
    [key: string]: SoftwareVerificationCase
}

export type MVRsMap = {
    [key: string]: ManualVerificationResult
}

export type StringArrayMap = {
    [key: string]: string[]
}

export type HoverClickHandlerArgs = {
    urn: string
    annotationType: AnnotationType
}
