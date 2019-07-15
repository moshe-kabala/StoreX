import { CtrlWrapper } from "../../src/wrappers/ctrl-wrapper";
import {
  ModelOptionsData,
  idType,
  idsType
} from "../../src/wrappers/wrapper-interface";
import { FilterData } from "../../src/filter-data";
import { MongoResult } from "../../src/wrappers/MongoResult";
import { ResultStatus } from "../../src/wrappers/ResultStatus";

class CtrlWrapperMock extends CtrlWrapper {
  constructor() {
    super({
      data: modelOptionsDataMock,
      modelName: "test",
      modelsName: "tests"
    });
  }
}

export const ctrlWrapperMock = new CtrlWrapperMock();

class ModelOptionsDataMock implements ModelOptionsData<any> {
  collection = [
    { id: "1", name: "yam", age: "20" },
    { id: "2", name: "mor", age: "22" },
    { id: "3", name: "uri", age: "24" },
    { id: "4", name: "bar", age: "26" },
    { id: "5", name: "idit", age: "28" }
  ];

  get(id: idType) {
    return this.collection.find(user => {
      return user.id == id;
    });
  }

  add(data: any) {
    this.collection.push(data);
  }

  remove(id) {
    let result = new MongoResult();

    try {
      for (var i = 0; i < this.collection.length; i++) {
        if (this.collection[i] == id) {
          this.collection.splice(i, 1);
        }
      }

      result.data = this.get(id);
      result.status = ResultStatus.Success;
      return result;
    } catch (err) {
      result.error = err;
      result.status = ResultStatus.DBError;
      return result;
    }
  }

  update(data) {
    return null;
  }

  getMany(ids?: idsType) {
    return null;
  }

  addMany(data) {
    return null;
  }

  removeMany(ids) {
    let result = new MongoResult();
    try {
      result.data = [];

      ids.forEach(id => {
        let user: MongoResult = this.remove(id);
        if (user.data) {
          result.data.push(user.data);
        }
      });

      result.status = ResultStatus.Success;
      return result;
    } catch (err) {
      result.status = ResultStatus.DBError;
      return result;
    }
  }

  getManyByFilter(filter: FilterData) {
    return null;
  }
}

export const modelOptionsDataMock = new ModelOptionsDataMock();
