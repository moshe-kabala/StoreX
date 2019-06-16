import { ResultStatus } from "./ResultStatus";

export class MongoResult {
    data = undefined;
    status = ResultStatus.NoStatus;
    error = "";
}