import { Router, Request, Response } from "express";
import { ModelOptionsCtrl, ModelOptionsData, idType, idsType } from ".";

import * as Ajv from "ajv";
import { FilterData } from "@/filter-data";

export class BLWrapper<T = any> implements ModelOptionsData<T> {
  data;
  modelName;
  modelsName;
  _validation;
  modelSchema;
  filterValidation;

  constructor({
    data,
    modelName,
    modelsName,
    validation,
    modelSchema,
    filterValidation
  }: {
    data: ModelOptionsData<T>;
    modelName: string;
    modelsName: string;
    modelSchema?: any;
    validation?;
    filterValidation?;
  }) {
    this.data = data;
    this.modelName = modelName;
    this.modelsName = modelsName;
    this.modelSchema = modelSchema;

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
  remove(id: idType): any {
    return this.remove(id);
  }
  add(data: T): any {
    return this.add(data);
  }
  update(data: T): any {
    return this.update(data);
  }
  get(id: idType): any {
    return this.get(id);
  }
  getMany(ids?: idsType): any {
    return this.getMany(ids);
  }
  addMany(data: T[]): any {
    return this.addMany(data);
  }
  removeMany(ids: idsType): any {
    return this.removeMany(ids);
  }
  getManyByFilter(filter: FilterData): any {
    return this.getManyByFilter(filter);
  }
}
