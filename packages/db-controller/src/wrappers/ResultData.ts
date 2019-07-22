import { ResultStatus } from "./ResultStatus";

export class ResultData {
    data;
    status = ResultStatus.NoStatus;
    error;
}