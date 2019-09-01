import { ModelOptionsData, idType, idsType } from "../../src/wrappers";
import { ResultData } from "../../src/wrappers/ResultData";
import { ResultStatus } from "../../src/wrappers/ResultStatus";
import { FilterData } from "../../src/filter-data";

export class ResponseMock {
  
  responseData;
  responseStatus = 200;

  status(someStatus) { 
    this.responseStatus = someStatus;
    return this;
  }

  send(data) {
    this.responseData = data;
    return this;
  }
}

class ModelOptionsDataMock implements ModelOptionsData<any> {
    collection = [
      { id: "1", name: "yam", age: "20" },
      { id: "2", name: "mor", age: "22" },
      { id: "3", name: "uri", age: "24" },
      { id: "4", name: "bar", age: "26" },
      { id: "5", name: "idit", age: "28" }
    ];
  
    get(id: idType) {
      return this.collection.find(user => user.id == id);
    }
  
    add(data: any) {
      this.collection.push(data);
    }
  
    remove(id) {
      let result = new ResultData();
  
      try {
        result.prevData = this.get(id);
        for (var i = 0; i < this.collection.length; i++) {
          if (this.collection[i].id == id) {
            this.collection.splice(i, 1);
          }
        }
  
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
      let result = new ResultData();
      try {
        result.prevData = [];
  
        ids.forEach(id => {
          let user: ResultData = this.remove(id);
          if (user.prevData) {
            result.prevData.push(user.prevData);
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