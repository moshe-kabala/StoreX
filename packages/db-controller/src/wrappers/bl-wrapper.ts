import { Router, Request, Response } from "express";
import { ModelOptionsCtrl, ModelOptionsData, idType, idsType } from ".";

import * as Ajv from "ajv";
import { map } from "./map";
import { FilterData } from "../filter-data";

export class BLWrapper<T = any> implements ModelOptionsData<T> {
  data;
  modelName;
  modelsName;
  _validation;
  modelSchema;
  filterValidation;
  _mapFrom;
  _mapTo;

  constructor({
    data,
    modelName,
    modelsName,
    validation,
    modelSchema,
    filterValidation,
    mapFrom,
    mapTo,
  }: {
    data: ModelOptionsData<T>;
    modelName: string;
    modelsName: string;
    modelSchema?: any;
    validation?;
    filterValidation?;
    mapFrom?: (itemOrItems) => any;
    mapTo?: (itemOrItems) => any;
  }) {
    this.data = data;
    this.modelName = modelName;
    this.modelsName = modelsName;
    this.modelSchema = modelSchema;
    this._mapFrom = mapFrom;
    this._mapTo = mapTo;

    this.filterValidation = filterValidation;
    if (validation) {
      this._validation = validation;
    } else if (modelSchema) {
      const v = new Ajv();
      const _validation = v.compile(modelSchema);
      this._validation = m => {
        _validation(m);
        return _validation.errors;
      };
    }

    // bind the function to data
    this.remove = this.remove.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.get = this.get.bind(this);
    this.getMany = this.getMany.bind(this);
    this.addMany = this.addMany.bind(this);
    this.removeMany = this.removeMany.bind(this);
    this.getManyByFilter = this.getManyByFilter.bind(this);
  }

  async mapFrom(items: any | any[]) {
    return map(items, this._mapFrom);
  }
  async mapTo(items: any | any[]) {
    return map(items, this._mapTo);
  }
  remove(id: idType): Promise<any> {
    return this.data.remove(id);
  }
  async add(data: T): Promise<any> {
    return this.data.add(await this.mapTo(data));
  }
  async update(data: T): Promise<any> {
    return this.data.update(await this.mapTo(data));
  }
  async get(id: idType): Promise<any> {
    try {
      return this.mapFrom(await this.data.get(id));
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getMany(ids?: idsType): Promise<any> {
    try {
      return this.mapFrom(await this.data.getMany(ids));
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async addMany(data: T[]): Promise<any> {
    return this.data.addMany(await this.mapTo(data));
  }
  async removeMany(ids: idsType): Promise<any> {
    return this.data.removeMany(ids);
  }
  async getManyByFilter(filter?: FilterData): Promise<any> {
    try {
      let data = await this.data.getManyByFilter(filter);
      if(data instanceof Array){
        data =  await this.mapFrom(data);
      } else if (data.data){
        data.data = await this.mapFrom(data.data)
      }
      return data
    } catch (err) {
      return Promise.reject(err);
    }
  }
}


