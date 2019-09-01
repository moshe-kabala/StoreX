import { Router, Request, Response } from "express";
import { ModelOptionsCtrl, ModelOptionsData } from ".";
import { ResultData } from "./ResultData";

import * as Ajv from "ajv";
import { ResultStatus } from "./ResultStatus";

export interface CtrlStatus {
  success: boolean;
  data: any;
  errMsg: string;
}

export class CtrlWrapper<T = any> implements ModelOptionsCtrl {
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

    // bind the function to this
    this.remove = this.remove.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.get = this.get.bind(this);
    this.getMany = this.getMany.bind(this);
    this.addMany = this.addMany.bind(this);
    this.removeMany = this.removeMany.bind(this);
    this.getManyByFilter = this.getManyByFilter.bind(this);
  }

  connectRouter = (router: Router) => {
    // todo...
  };

  _getAndValidIDs(req, res, canBeEmpty = false) {
    const id = req.body.ids;
    if (!id && !canBeEmpty) {
      const msg = "IDs are empty";
      res.status(400).send({ msg, result: this.getValidationErrorResponse(msg) });
      return false;
    }
    return id;
  }
  _getAndValidFilter(req, res) {
    let filter = req.body;
    if (!filter) {
      filter = {}
    }
    return filter;
  }

  _getAndValidID(req, res, canBeEmpty = false) {
    const id = req.params.id;
    if (!id && !canBeEmpty) {
      const msg = "ID is empty";
      res.status(400).send({ msg, result: this.getValidationErrorResponse(msg) });
      return false;
    }
    return id;
  }

  getValidationErrorResponse(err) {
    const validationResponse = new ResultData();
    validationResponse.error = err;
    validationResponse.status = ResultStatus.ValidationError;
    return validationResponse;
  }

  _getAndValidModels(req, res, canBeEmpty = false) {
    const models = req.body;
    if (!models && !canBeEmpty) {
      res.status(400).send({ msg: "Not a valid ID" });
      return false;
    } else if (!models) {
      return;
    }
    for (const model of models) {
      if (this._isModelValid(model, req, res) == false) {
        return false;
      }
    }
    return models;
  }

  _getAndValidModel(req, res, canBeEmpty = false) {
    const model = req.body;
    if (!model && !canBeEmpty) {
      res.status(400).send({ msg: "Not a valid ID" });
      return false;
    } else if (!model) {
      return;
    }
    if (this._isModelValid(model, req, res) === false) {
      return false;
    }
    return model;
  }

  _isModelValid(m, req, res) {
    let err;
    if (this._validation) {
      err = this._validation(m);
    }
    if (err) {
      res.status(400).send({ msg: "Not a valid body data", err });
      return false;
    }
  }

  _failed({ err, res, msg }, responseData?) {
    if (!responseData) {
      responseData = new ResultData();
      responseData.status = ResultStatus.InternalError;
      responseData.error = err;
    }

    res.status(400).send({ msg, err, responseData });
    return responseData;
  }

  async get(req: Request, res: Response) {
    const status: any = { success: false, errMsg: "", data: {} };
    try {
      const id = await this._getAndValidID(req, res);
      if (id == false) {
        return status;
      }
      const result = await this.data.get(id);
      res.send(result);
      return status;
    } catch (err) {
      this._failed({ err, res, msg: "Failed to get data" });
    }
  }

  async add(req: Request, res: Response) {
    let addResult: ResultData;
    const status: any = { success: false, errMsg: "", data: { model: {} } };
    try {
      const model = await this._getAndValidModel(req, res);
      if (model == false) {
        return status;
      }
      addResult = await this.data.add(model);
      res.send({ result: addResult, msg: "added" });
      return addResult;
    } catch (err) {
      status.errMsg = err;
      this._failed({ err, res, msg: "Failed to add data" });

      return status;
    }
  }

  async remove(req: Request, res: Response) {
    let removeResult: ResultData;
    try {
      // Check if the ID is valid and get it
      const removeId = this._getAndValidID(req, res);
      if (!removeId) {
        return false;
      }
      removeResult = await this.data.remove(removeId);
      res.send({ result: removeResult, msg: "removed" });
      return removeResult;
    } catch (err) {
      return this._failed({ err, res, msg: "Failed to remove data" }, removeResult);
    }
  }

  async update(req: Request, res: Response) {
    let updateResult: ResultData;
    const status: any = { success: false, errMsg: "", data: { model: {} } };
    try {
      const model = this._getAndValidModel(req, res);
      if (model == false) {
        return status;
      }
      updateResult = await this.data.update(model);
      res.send({ msg: "updated" });
      return updateResult;
    } catch (err) {
      status.errMsg = err;
      this._failed({ err, res, msg: "Failed to update data" });
      return status;
    }
  }
  async getMany(req: Request, res: Response) {
    try {
      const ids = this._getAndValidIDs(req, res, true);
      if (!ids == false) {
        return;
      }
      const result = await this.data.getMany(ids);
      res.send(result);
    } catch (err) {
      this._failed({ err, res, msg: "Failed to get data" });
    }
  }

  async addMany(req: Request, res: Response): Promise<CtrlStatus> {
    try {
      const models = this._getAndValidModels(req, res);
      if (models == false) {
        return;
      }
      await this.data.addMany(models);
      res.send({ msg: "added" });
    } catch (err) {
      this._failed({ err, res, msg: "Failed to add data" });
    }
  }
  async removeMany(req: Request, res: Response) {
    let removeResult: ResultData = new ResultData();
    try {
      const ids = this._getAndValidIDs(req, res);
      if (!ids) {
        return false;
      }
      removeResult = await this.data.removeMany(ids);
      res.send({ data: removeResult, msg: "removed" });
      return removeResult;
    } catch (err) {
      return this._failed({ err, res, msg: "Failed to remove data" }, removeResult);
    }
  }
  async getManyByFilter(req: Request, res: Response) {
    try {
      const filter = this._getAndValidFilter(req, res);
      if (filter == false) {
        return;
      }
      const result = await this.data.getManyByFilter(filter);
      res.send(result);
      return result;
    } catch (err) {
      this._failed({ err, res, msg: "Failed to get data by filter" });
    }
  }
}
