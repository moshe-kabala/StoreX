import { ResultStatus } from "./ResultStatus";

export class ResultData {
    data: any;
    prevData: any;
    status: ResultStatus = ResultStatus.NoStatus;
    error: any;
    constructor(result?: any) {
        Object.assign(this, result || {});
    }
}