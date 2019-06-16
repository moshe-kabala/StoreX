import { ResultStatus } from "./ResultStatus";

export class MongoResult {
    data;
    status = ResultStatus.NoStatus;
    error;
}