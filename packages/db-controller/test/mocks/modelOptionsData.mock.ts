import { ModelOptionsData, idType, idsType } from "../../src/wrappers";
import { ResultData } from "../../src/wrappers/ResultData";
import { ResultStatus } from "../../src/wrappers/ResultStatus";
import { FilterData } from "../../src/filter-data";

class ResponseMock {
    status(something) { 
      return responseStatusMock;
    }
    send(something) {
      return something;
    }
  }
  
  export const responseMock = new ResponseMock();
  
  class ResponseStatusMock {
    send(something) {  
      return something;
    }
    status(something) {
      return responseMock;
    }
  }
  
export const responseStatusMock = new ResponseStatusMock();

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
        result.data = this.get(id);
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
        result.data = [];
  
        ids.forEach(id => {
          let user: ResultData = this.remove(id);
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