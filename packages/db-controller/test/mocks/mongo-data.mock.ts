import { MongoCollectionWrapper } from "../../src/wrappers";
import { MongoClient, Cursor } from "mongodb";
export const singleDeletionSuccessfulResultOneObj = { "acknowledged" : true, "deletedCount" : 1 };
export const singleDeletionSuccessfulResultNoObj = { "acknowledged" : true, "deletedCount" : 0 };
export const deletionSuccessfulResultAllObj = { "acknowledged" : true, "deletedCount" : 3 };
export const deletionSuccessfulResultAFewObj = { "acknowledged" : true, "deletedCount" : 2 };
export const deletionSuccessfulResultManyObj = { "acknowledged" : true, "deletedCount" : 0 };

class CollectionMock {
    db = []

    async insert(item){
        const uuid = 1;
        item["_id"] = uuid;
        this.db.push(item);
    }

    async insertMany(items){
        let uuid = 2;
        items.map(item => { 
            item["_id"] = uuid;
            this.db.push(item);
            uuid++;
        })
    }

    // find method for get
    async findOne(id){
        const ID = id._id;
        const filtered = this.db.find(function (item) { return item._id == ID } );

        if(Array.isArray(filtered)){
            if(filtered.length > 1){
                return filtered[0];
            } else {
                // There is no such object
                return undefined;
            }
        } else if (typeof filtered == "object") {
            return filtered;
        }
    }

    // find method for getMany
    async find(ids){
        const IDs = ids._id.$in;
        const filtered = new Array();
        IDs.map(id => {
            this.db.map(item => { 
                if (item._id === id) {
                    filtered.push(item);
                }
            });
        })

        let cursor = new CursorMock(filtered);
        return cursor;
    }

    async deleteOne(id) {
        if (typeof(id._id) === "number") { // A condition for testing the exception
            if (await this.doesExist(id)) {
                this.db = this.db.filter((item) => { item._id !== id._id } );
                return singleDeletionSuccessfulResultOneObj;
            } else {
                return singleDeletionSuccessfulResultNoObj;
            }
        } else {
            throw "not a number";
        }
    }

    doesExist(id) {
        let res = false;
        res = this.db.some(obj => {
                    if (obj._id === id._id) {
                        return true;
                    }
                });
        return res;
    }

    async deleteMany(ids) {
        // Counter to count how many objects we've removed
        let counter = 0;
        
        ids._id.$in.forEach(id => {
            if (typeof(id) === 'number') { // Just an example to test the throw exception part
                this.db.some((item, index) => {
                    if (item._id === id) {
                        counter++;
                        
                        // Remove the item from the DB
                        this.db.splice(index,1);
                        return true;
                    }
                });
            } else {
                throw "not a number";
            }
        });

        deletionSuccessfulResultManyObj.deletedCount = counter;
        return deletionSuccessfulResultManyObj;
    }
}

async function getCollection(){
    return collectionMock;
}

const collectionMock = new CollectionMock()

class MongoDataMock extends MongoCollectionWrapper {
    constructor() {
        super({ getCollection: () => getCollection() });
    }
}

export const mongoDataMock = new MongoDataMock();

// A mock to test the removeMany method that uses a cursor
export class CursorMock {

    dataArray = [];

    constructor(data) {
        this.dataArray = data;
    }

    async toArray() {
        return this.dataArray;
    }
}
