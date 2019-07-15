import "jest";
import { ctrlWrapperMock } from './mocks/ctrl-wrapper.mock';
import { MongoResult } from "../src/wrappers/MongoResult";
import { ResultStatus } from "../src/wrappers/ResultStatus";


describe("CtrlWrapper", () => {
    test("delete one", async () => {
        let req;
        req.params = { id: "1" };
        let res = {};
        
        const userObject1 = { id: "6", name: "Joni", age: "30" };
        await ctrlWrapperMock.add(userObject1, res);


        
        // Remove that object
        const result = await ctrlWrapperMock.remove(req, res);

        const expectedResult: MongoResult = {
            data : userObject1,
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult)
    });
});