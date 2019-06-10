import "jest";
import { mongoDataMock } from "./mocks/mongo-data.mock";
import { FilterDataMongo } from "../src/filter-data/filter-data-mongo";
import { ModelOptionsData } from "../src/wrappers/wrapper-interface";
 import * as sinon from "sinon";
import { MongoResult } from "../src/wrappers/mongo-result";
import { MongoClient, Db } from 'mongodb';
import {Mongo} from '../src/db-connections/mongo';
import { MongoCollectionWrapper } from "../src/wrappers";
import { Collection } from "./../../container/src/collection"

const singleDeletionSuccessfulResultOneObj = { "acknowledged" : true, "deletedCount" : 1 };
const singleDeletionSuccessfulResultNoObj = { "acknowledged" : true, "deletedCount" : 0 };

const userObject1 = { _id: 1, name: "Idit" };

describe("MongoCollectionWrapper", () => {

    test("delete one", async () => {
        await mongoDataMock.add(userObject1);
        const res = await mongoDataMock.remove(1);
        const expectedResult = {
            object : userObject1,
            status: singleDeletionSuccessfulResultOneObj
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that doesn't exist", async () => {
        const res = await mongoDataMock.remove(1);
        const expectedResult = {
            object : undefined,
            status: singleDeletionSuccessfulResultNoObj
        }
        
        expect(res).toEqual(expectedResult)
    });

    test("delete one that throws exception", async () => {
        try {
            const res = await mongoDataMock.remove("1");
            console.log("delete one throw exception result:", res);
        } catch (err) {
            const expectedResult = {
                "err": "not a number",
                "msg": "failed"
            }
        
            expect(err).toEqual(expectedResult);
        }
    });

    // test("delete one with sinon", async () => {
    //     const mcw = new MongoCollectionWrapper({
    //         getCollection : function() {
    //             return sinon.mock(Collection)

    //         }
    //     });

    //     // Create the end result object we expect
    //     const removeObject1ExpectedResult = new MongoResult;
    //     removeObject1ExpectedResult.status = singleDeletionSuccessfulResultObj;
    //     removeObject1ExpectedResult.object = userObject1;

    //     // Mock the DB functions
    //     var storeMock = sinon.mock(mongoDataMock.getCollection);
    //     console.log("storeMock:", storeMock);
    //     storeMock.expects('findOne').withArgs({ _id: 1 }).returns(userObject1);
    //     storeMock.expects('deleteOne').once().withArgs({ _id: 1 }).returns(removeObject1ExpectedResult.status);

    //     // Add a new object to remove afterwards
    //     console.log("before adding values");
    //     await mongoDataMock.add(userObject1);

    //     // Remvoe the object we created
    //     console.log("values added");
    //     const res = await mongoDataMock.remove(1);


    //     console.log("after remove");

    //     // const expectedResult = {
    //     //     object : userObject1,
    //     //     status: singleDeletionSuccessfulResultObj
    //     // }
        
    //     expect(res).toEqual(removeObject1ExpectedResult)
    // });

    // test("delete one with sinon stubs", async () => {
    //     let mongoClientStub = new MongoClient();
    //     let findOneStub = sinon.stub(mongoClientStub, "findOne");

    //     const expectedResult = {
    //         object : userObject1,
    //         status: singleDeletionSuccessfulResultObj
    //     }

    //     // Add a new object to remove afterwards
    //     console.log("before adding values");
    //     await mongoDataMock.add(userObject1);

    //     // findOneStub.restore();


    //     sinon.assert.calledWith(findOneStub, expectedResult);


    //     // // Remvoe the object we created
    //     // console.log("values added");
    //     // const res = await mongoDataMock.remove(1);

    // });
  });
  