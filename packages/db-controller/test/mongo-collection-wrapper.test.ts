import "jest";
import { mongoDataMock, 
    singleDeletionSuccessfulResultOneObj, 
    singleDeletionSuccessfulResultNoObj,
    deletionSuccessfulResultAllObj,
    deletionSuccessfulResultAFewObj,
    deletionSuccessfulResultManyObj} from "./mocks/mongo-data.mock";

const userObject1 = { _id: 1, name: "Idit" };

describe("MongoCollectionWrapper", () => {

    test("delete one", async () => {
        // Add the object to remove
        await mongoDataMock.add(userObject1);

        // Remove that object
        const res = await mongoDataMock.removeWithData(1);

        const expectedResult = {
            object : userObject1,
            status: singleDeletionSuccessfulResultOneObj
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that doesn't exist", async () => {
        // Remove an object without inserting it to the DB first
        const res = await mongoDataMock.removeWithData(1);

        const expectedResult = {
            object : undefined,
            status: singleDeletionSuccessfulResultNoObj
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that throws an exception", async () => {

        try {
            // Try to remove an object with the wrong type ID
            const res = await mongoDataMock.removeWithData("1");
        } catch (err) {
            const expectedResult = {
                "err": "not a number",
                "msg": "failed"
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
        const res = await mongoDataMock.removeManyWithData(manyIds);

        const expectedResult = {
            object : userObjectMany,
            status: deletionSuccessfulResultAllObj
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
        const res = await mongoDataMock.removeManyWithData(aFewIds);

        const userObjectAFew = [
            { _id: 2, name: "Yam" },
            { _id: 4, name: "Mor" }
        ];

        const expectedResult = {
            object : userObjectAFew,
            status: deletionSuccessfulResultAFewObj
        }
        
        expect(res).toEqual(expectedResult);
    });

    test("delete many that throws an exception", async () => {
        try {
            // Try to remove an object with the wrong type ID
            const res = await mongoDataMock.removeManyWithData(["1"]);
        } catch (err) {
            const expectedResult = {
                "err": "not a number",
                "msg": "failed"
            }
        
            expect(err).toEqual(expectedResult);
        }
    });
    
    test("delete many that don't exist", async () => {
        // Try to remove objects that we didn't insert to the DB first
        const res = await mongoDataMock.removeManyWithData([5,6]);
        
        const expectedResult = {
            object : [],
            status: deletionSuccessfulResultManyObj
        }
        
        expect(res).toEqual(expectedResult)
    });
  });