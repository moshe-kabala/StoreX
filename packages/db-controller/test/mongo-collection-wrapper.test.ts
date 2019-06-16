import "jest";
import { mongoDataMock } from "./mocks/mongo-data.mock";
import { ResultStatus } from "../src/wrappers/ResultStatus";


describe("MongoCollectionWrapper", () => {
    
    test("delete one", async () => {
        const userObject1 = { _id: 1, name: "Idit" };

        // Add the object to remove
        await mongoDataMock.add(userObject1);

        // Remove that object
        const res = await mongoDataMock.remove(1);

        const expectedResult = {
            data : userObject1,
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that doesn't exist", async () => {
        // Remove an object without inserting it to the DB first
        const res = await mongoDataMock.remove(1);

        const expectedResult = {
            data : undefined,
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that throws an exception", async () => {
        // Checks how the object looks like when there's an error
        try {
            // Try to remove an object with the wrong type ID
            const res = await mongoDataMock.remove("1");
        } catch (err) {
            const expectedResult = {
                data : undefined,
                status: ResultStatus.DBError,
                error: "not a number"
            }
        
            expect(err).toEqual(expectedResult);
        }
    });

    test("delete many - all objects", async () => {
        const manyIds = [2, 3, 4];

        const userObjectMany = [
            { _id: 2, name: "Yam" },
            { _id: 3, name: "Slava" },
            { _id: 4, name: "Mor" }
        ];

        // Add the object to remove
        await mongoDataMock.addMany(userObjectMany);
        
        // Remove all of these objects
        const res = await mongoDataMock.removeMany(manyIds);

        const expectedResult = {
            data : userObjectMany,
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult);
    });
    
    test("delete many - a few objects", async () => {

        const aFewIds = [2, 4];

        const userObjectMany = [
            { _id: 2, name: "Yam" },
            { _id: 3, name: "Slava" },
            { _id: 4, name: "Mor" }
        ];

        // Add the objects to remove
        await mongoDataMock.addMany(userObjectMany);

        // Remove a few of these objects
        const res = await mongoDataMock.removeMany(aFewIds);

        const userObjectAFew = [
            { _id: 2, name: "Yam" },
            { _id: 4, name: "Mor" }
        ];

        const expectedResult = {
            data : userObjectAFew,
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult);
    });

    test("delete many that throws an exception", async () => {
        // Checks how the object looks like when there's an error
        try {
            // Try to remove an object with the wrong type ID
            const res = await mongoDataMock.removeMany(["1"]);
        } catch (err) {
            const expectedResult = {
                data : [],
                status: ResultStatus.DBError,
                error: "not a number"
            }   
        
            expect(err).toEqual(expectedResult);
        }
    });
    
    test("delete many that don't exist", async () => {
        // Try to remove objects that we didn't insert to the DB first
        const res = await mongoDataMock.removeMany([5,6]);
        
        const expectedResult = {
            data : [],
            status: ResultStatus.Success,
            error: undefined
        }
        
        expect(res).toEqual(expectedResult)
    });
  });