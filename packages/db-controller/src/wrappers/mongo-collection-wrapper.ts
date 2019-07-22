import { FilterDataMongo } from "../filter-data/filter-data-mongo";
import { ModelOptionsData, idType, idsType } from "./wrapper-interface";
import { EventEmitter } from "events";
import { ResultData } from "./ResultData";
import { ResultStatus } from "./ResultStatus";

export enum MongoCollectionWrapperEvents {
  Change = "change"
}

const e = MongoCollectionWrapperEvents;

// todo this class is abstract for mongo
export class MongoCollectionWrapper<T = any> extends EventEmitter implements ModelOptionsData<T>  {
  getCollection;
  itemToId;
  constructor({ getCollection, itemToId }: { getCollection; itemToId?}) {
    super();
    this.getCollection = getCollection;
    this.itemToId = itemToId || (i => i._id);
  }

  async get(id) {
    try {
      return (await this.getCollection()).findOne({ _id: id });
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getManyByFilter(filter, whatGet?) {
    if (!filter) {
      return this.getMany(undefined, whatGet)
    }
    try {
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
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async set(data: T) {
    let isFailed = false;
    try {
      return (await this.getCollection()).updateOne(
        { _id: this.itemToId(data) },
        { $set: data }
      );
    }
    catch (err) {
      isFailed = true
      return Promise.reject({ msg: "failed", err })
    } finally {
      if (!isFailed) {
        this.emit(e.Change, { action: "set", data });
      }
    }
  }

  async update(data: T) {
    let isFailed = false;
    try {
      return (await this.getCollection()).updateOne(
        { _id: this.itemToId(data) },
        data
      );
    } catch (err) {
      isFailed = true
      return Promise.reject({ msg: "failed", err })
    } finally {
      if (!isFailed) {
        this.emit(e.Change, { action: "update", data });
      }
    }
  }

  async add(data: T) {
    let isFailed = false;

    try {
      return (await this.getCollection()).insert(data);
    } catch (err) {
      isFailed = true
      return Promise.reject({ msg: "failed", err })
    } finally {
      if (!isFailed) {
        this.emit(e.Change, { action: "add", data });
      }
    }
  }

  async remove(id: idType) {
    const mongoResult = new ResultData();

    try {
      // Get the object before removing
      mongoResult.data = await this.get(id);

      // Remove the object and return the result
      await (await this.getCollection()).deleteOne({ _id: id });
      mongoResult.status = ResultStatus.Success;
      this.emit(e.Change, { action: "remove", data: id });
      return mongoResult;
    } catch (err) {
      mongoResult.status = ResultStatus.DBError;
      mongoResult.error = err;
      return Promise.reject(mongoResult);
    }
  }
  
  async removeMany(ids: idsType) {
    const mongoResult = new ResultData();

    try {
      // Get the object before removing
      mongoResult.data = await this.getMany(ids);

      // Remove the object and return the result
      await (await this.getCollection()).deleteMany({ _id: { $in: ids } });
      mongoResult.status = ResultStatus.Success;
      this.emit(e.Change, { action: "removeMany", data: ids });
      return mongoResult;
    } catch (err) {
      mongoResult.status = ResultStatus.DBError;
      mongoResult.error = err;
      return Promise.reject(mongoResult)
    } 
  }

  async getMany(ids?: idsType, whatGet?) {
    try {
      const collection = await this.getCollection();
      let query: any = {};
      if (ids) {
        query._id = { $in: ids };
      }

      let c = await collection.find(query, whatGet);
      return c.toArray();
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async addMany(data: T[]) {
    let isFailed = false
    try {
      return (await this.getCollection()).insertMany(data);
    } catch (err) {
      isFailed = true
      return Promise.reject({ msg: "failed", err })
    } finally {
      if (!isFailed) {
        this.emit(e.Change, { action: "addMany", data });
      }
    }
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
