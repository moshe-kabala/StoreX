import "jest";
import { ctrlWrapperMock } from './mocks/ctrl-wrapper.mock';
import { ResultData } from "../src/wrappers/ResultData";
import { ResultStatus } from "../src/wrappers/ResultStatus";
import { responseMock, responseStatusMock } from "./mocks/modelOptionsData.mock";


describe("CtrlWrapper", () => {
    test("delete one", async () => {
        let request = { params: { id: "1" } };
        let response = responseStatusMock;

        // Remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult: ResultData = new ResultData();
        expectedResult.data = { id: "1", name: "yam", age: "20" };
        expectedResult.status = ResultStatus.Success;

        expect(result).toEqual(expectedResult);
    });

    test("delete one with an invalid id", async () => {
        let request = { params: { id: undefined } };
        let response = responseStatusMock;

        // Try to remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult = false;

        expect(result).toEqual(expectedResult);
    });

    test("delete one with id that doesn't exist", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { params: { id: "6" } };
        let response = responseStatusMock;

        // Try to remove that object
        const result = await ctrlWrapperMock.remove(request, response);

        const expectedResult = { data: undefined, status: 200 };

        expect(result).toEqual(expectedResult);
    });

    test("delete many - delete all", async () => {
        ctrlWrapperMock.refreshCollection();

        let request = { body: { ids: ["1", "2", "3", "4", "5"] }};
        let response = responseStatusMock;

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { data: [
            { id: "1", name: "yam", age: "20" },
            { id: "2", name: "mor", age: "22" },
            { id: "3", name: "uri", age: "24" },
            { id: "4", name: "bar", age: "26" },
            { id: "5", name: "idit", age: "28" }
          ], status: 200 };

        expect(result).toEqual(expectedResult);
    });


    test("delete many - delete some", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { body: { ids: ["3", "4"] }};
        let response = responseStatusMock;

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { data: [
            { id: "3", name: "uri", age: "24" },
            { id: "4", name: "bar", age: "26" }]
            , status: 200 };
        
        expect(result).toEqual(expectedResult);
    });

    test("delete many with invalid ids", async () => {
        let request = { body: { } };
        let response = responseStatusMock;

        // Try to remove that object
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = false;
        
        expect(result).toEqual(expectedResult);
    });

    test("delete many with ids that doesn't exist", async () => {
        ctrlWrapperMock.refreshCollection();
        let request = { body: { ids: ["6", "7"] } };
        let response = responseStatusMock;

        // Try to remove these objects
        const result = await ctrlWrapperMock.removeMany(request, response);

        const expectedResult = { data: [], status: 200 };
        
        expect(result).toEqual(expectedResult);
    });
});