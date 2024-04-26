// Copyright © LFV

import { AnnotationType } from './enums/AnnotationType'

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
    reqs_from_urn?: StringArrayMap
    svcs_from_urn?: StringArrayMap
    svcs_from_req?: StringArrayMap
    mvrs_from_urn?: StringArrayMap
    mvrs_from_svc?: StringArrayMap
}

/**
 * This definition is simplified. Some of these are enums but keeping
 * track of that is unnecessary when only displaying the data.
 */
type Requirement = {
    id: string
    title: string
    significance: string
    description: string
    rationale: string
    revision: Revision
    categories: string[]
    references: {
        requirement_ids: string[]
    }
}

type SoftwareVerificationCase = {
    id: string
    title: string
    description: string | null
    verification: string
    instructions: string | null
    revision: Revision
    requirement_ids: string[]
}

type ManualVerificationResult = {
    id: string
    comment: string
    passed: boolean
    svc_ids: string[]
}

export type Revision = {
    major: number
    minor: number
    patch: number
}

// Can't be an actual Map without modifying the JSON parsing.
type RequirementsMap = {
    [key: string]: Requirement
}

type SVCsMap = {
    [key: string]: SoftwareVerificationCase
}

type MVRsMap = {
    [key: string]: ManualVerificationResult
}

type StringArrayMap = {
    [key: string]: string[]
}

/**
 * Properties identifying an annotation, id can be just the id, or the urn.
 */
export type AnnotationId = {
    id: string
    type: AnnotationType
}

/**
 * Properties identifying an annotation, including workspace
 */
export type WorkspaceAnnotation = {
    urn: string
    type: AnnotationType
    workspaceKey: string
}
