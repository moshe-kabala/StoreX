import { MongoCollectionWrapper } from "../../src/wrappers";
export const singleDeletionSuccessfulResultOneObj = { "acknowledged" : true, "deletedCount" : 1 };
export const singleDeletionSuccessfulResultNoObj = { "acknowledged" : true, "deletedCount" : 0 };

class CollectionMock {
    db = []

    async insert(item){
        const uuid = 1;
        item["_id"] = uuid;
        this.db.push(item);
    }

    async findOne(id){
        const ID = id._id
        const filtered = this.db.find(function (item) { return item._id == ID } )

        if(Array.isArray(filtered)){
            if(filtered.length > 1){
                return filtered[0];
            } else {
                return undefined;
            }
        } else if (typeof filtered == "object") {
            return filtered;
        }
    }


    async deleteOne(id) {
        if (typeof(id._id) === "number") {
            console.log("deleteOne starting db:", this.db);
            if (await this.doesExist(id)) {
                this.db = this.db.filter((item) => { item._id !== id._id } );
                console.log("deleteOne after filtering the db:", this.db);
                return singleDeletionSuccessfulResultOneObj;
            } else {
                return singleDeletionSuccessfulResultNoObj;
            }
        } else {
            throw "not a number";
        }
    }

    async doesExist(id) {
        let res = false;
        this.db.map(obj => {
            if (obj._id === id._id) {
                res = true;
                return;
            } 
        })
        return res;
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
