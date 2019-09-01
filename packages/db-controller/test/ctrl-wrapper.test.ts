import "jest";
import { ctrlWrapperMock } from './mocks/ctrl-wrapper.mock';
import { ResultData } from "../src/wrappers/ResultData";
import { ResultStatus } from "../src/wrappers/ResultStatus";
import { ResponseMock } from "./mocks/modelOptionsData.mock";


describe("CtrlWrapper", () => {
    test("delete one", async () => {
        let request = { params: { id: "1" } };
        let response = new ResponseMock();

        // Remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult: ResultData = new ResultData();
        expectedResult.prevData = { id: "1", name: "yam", age: "20" };
        expectedResult.status = ResultStatus.Success;

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: {
                result: {
                    status: 200, prevData: {
                        id: "1", name: "yam", age: "20"
                    }
                },
                msg: 'removed'
            },
            responseStatus: 200
        };
        expect(response).toEqual(expectedResponse);
    });

    test("delete one with an invalid id", async () => {
        let request = { params: { id: undefined } };
        let response = new ResponseMock();

        // Try to remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult = false;

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: {
                msg: "ID is empty", result: {
                    error: "ID is empty",
                    status: 400
                }
            },
            responseStatus: 400
        }

        expect(response).toEqual(expectedResponse);
    });

    test("delete one with id that doesn't exist", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { params: { id: "6" } };
        let response = new ResponseMock();

        // Try to remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult = { data: undefined, status: 200 };

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: {
                msg: "removed", result: {
                    data: undefined,
                    status: 200
                }
            },
            responseStatus: 200
        }

        expect(response).toEqual(expectedResponse);
    });

    test("delete many - delete all", async () => {
        ctrlWrapperMock.refreshCollection();

        let request = { body: { ids: ["1", "2", "3", "4", "5"] } };
        let response = new ResponseMock();

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { msg: "removed" };

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: { msg: "removed" },
            responseStatus: 200
        }

        expect(response).toEqual(expectedResponse);
    });


    test("delete many - delete some", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { body: { ids: ["3", "4"] } };
        let response = new ResponseMock();

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { msg: "removed" };

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: { msg: "removed" },
            responseStatus: 200
        }

        expect(response).toEqual(expectedResponse);
    });

    test("delete many with invalid ids", async () => {
        let request = { body: {} };
        let response = new ResponseMock();

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = false;

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: {
                msg: "IDs are empty", result: {
                    error: "IDs are empty",
                    status: 400
                }
            },
            responseStatus: 400
        }

        expect(response).toEqual(expectedResponse);
    });

    test("delete many with ids that doesn't exist", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { body: { ids: ["6", "7"] } };
        let response = new ResponseMock();

        // Try to remove these objects
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { msg: "removed" };

        expect(result).toEqual(expectedResult);

        const expectedResponse = {
            responseData: { msg: "removed" },
            responseStatus: 200
        }

        expect(response).toEqual(expectedResponse);
    });
});