// Copyright © LFV
import { RequirementsToolOutput, StringArrayMap } from './types'

export default class Relation {
    reqsFromUrn: StringArrayMap
    svcsFromUrn: StringArrayMap
    svcsFromReq: StringArrayMap
    mvrsFromUrn: StringArrayMap
    mvrsFromSvc: StringArrayMap

    constructor(data: RequirementsToolOutput) {
        this.reqsFromUrn = data.reqs_from_urn
        this.svcsFromUrn = data.svcs_from_urn
        this.svcsFromReq = data.svcs_from_req
        this.mvrsFromUrn = data.mvrs_from_urn
        this.mvrsFromSvc = data.mvrs_from_svc
    }

    getReqsFromUrn(urn: string) {
        return this.reqsFromUrn[urn] ?? []
    }

    getSvcsFromUrn(urn: string) {
        return this.svcsFromUrn[urn] ?? []
    }

    getSvcsFromReq(req: string) {
        return this.svcsFromReq[req] ?? []
    }

    getMvrsFromUrn(urn: string) {
        return this.mvrsFromUrn[urn] ?? []
    }

    getMvrsFromSvc(svc: string) {
        return this.mvrsFromSvc[svc] ?? []
    }
}
