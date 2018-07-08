import { Collection } from "immutable";



interface collectionActions {
    add(item: object);
    addMany(items: object[]);
    remove(id);
    removeMany(ids: (string | number)[]);
    update();
    updateMany();
    get(filter);
}

class CollectionAPI {
    collection
    add() { }
}