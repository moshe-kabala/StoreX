import { MongoClient, Db, Collection } from 'mongodb';


export class Mongo {
    constructor ( private _url) {}

    // policy monitor db.
    private _db: Db;
    private _tryToConnect = false; // if someone try to connect.
    private _notifyWhenConnectingList = [];


    close = async () => {
        if ( this._db ) {
            await  this._db.close();
            this._db = undefined;
        }
    }

    connect = async (): Promise<Db> => {
        this._tryToConnect = true;
        const db = await MongoClient.connect(this._url);
        this._tryToConnect = false;

        this._notifyWhenConnectingList.forEach(f => {
            if (typeof f === 'function') {
                f(db);
            }
        });

        this._notifyWhenConnectingList = [];

        console.log('mongo is connected');
        db.on('close', () => {
            console.log('mongo connection closed');
        });

        return db;
    }

    getDb = async () => {
        if ( ! this._db && ! this._tryToConnect ) {
            this._db = await this.connect();
        } else if ( this._tryToConnect ) {
            return new Promise((resolve, reject) => {
                this._notifyWhenConnectingList.push( db => {
                    resolve( db );
                });
            });
        } else {
            return this._db;
        }
    }

    dropDatabase = async () => {
        await this.getDb(); // get the db
        await this._db.dropDatabase();
    }

    dropCollection = async (collectionName) => {
        const collection = await this.getCollection(collectionName); // get the collection.
        await collection.insert({addSpam: 'this is spam to create the collection if not existed before'});
        await collection.drop();
    }

    getCollection = async <TSchema = any>(collectionName: string): Promise< Collection<TSchema>> => {
        await this.getDb();
        const collection = await this._db.collection<TSchema>(collectionName);
        return new Promise< Collection<TSchema> >( (resolve, reject) => {
            resolve ( collection );
        });
    }
}
