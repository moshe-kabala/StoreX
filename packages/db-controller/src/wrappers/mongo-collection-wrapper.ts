import { FilterDataMongo } from "../filter-data/filter-data-mongo";
import { ModelOptionsData, idType, idsType } from "./wrapper-interface";

// todo this class is abstract for mongo
export class MongoCollectionWrapper<T = any> implements ModelOptionsData<T> {
  getCollection;
  itemToId;
  constructor({ getCollection, itemToId }: { getCollection; itemToId? }) {
    this.getCollection = getCollection;
    this.itemToId = itemToId || (i => i._id);
  }

  async get(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: id });
  }

  async getManyByFilter(filter, whatGet?) {
    if (!filter) {
      return this.getMany(undefined,whatGet )
    }
    let collection = await this.getCollection();
    let isLimit;
    if(!(filter instanceof FilterDataMongo)){
      filter = new FilterDataMongo(filter)
    }
    filter.insertPath();

    const ftr = this.prepareFilter(filter);

    let c = await collection.find(ftr.query, whatGet);
    const length = await c.count();
    if (ftr.sortBy) {
      c = c.sort(ftr.sortBy);
    }

    if (ftr.limitData) {
      isLimit = true;
      c = c.skip(ftr.limitData.from).limit(ftr.limitData.limit);
    }

    const data = await c.toArray();

    return isLimit
      ? {
          data,
          length
        }
      : data;
  }
  async set(data: T) {
    return (await this.getCollection()).updateOne(
      { _id: this.itemToId(data) },
      { $set: data }
    );
  }

  async update(data: T) {
    return (await this.getCollection()).updateOne(
      { _id: this.itemToId(data) },
      data
    );
  }

  async add(data: T) {
    return (await this.getCollection()).insert(data);
  }
  async remove(id: idType) {
    return (await this.getCollection()).deleteOne({ _id: id });
  }
  async removeMany(ids: idsType) {
    return (await this.getCollection()).deleteMany({ _id: { $in: ids } });
  }
  async getMany(ids?: idsType, whatGet?) {
    let collection = await this.getCollection();
    let query: any = {};
    if (ids) {
      query._id = { $in: ids };
    }

    let c = await collection.find(query, whatGet);

    return c.toArray();
  }

  async addMany(data: T[]) {
    return (await this.getCollection()).insertMany(data);
  }
 
  prepareFilter(filter?: FilterDataMongo) {
    const query: any = filter ? filter.mongoFilter : {};
    if (query.id) {
      query._id = query.id;
      delete query.id;
    }
    const sortBy = filter ? filter.mongoSortBy : undefined;
    const limitData = filter ? filter.limitData : undefined;
    return {
      query,
      sortBy,
      limitData
    };
  }
}
