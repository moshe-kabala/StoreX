import { Router, Request, Response } from "express";
import { ModelOptionsCtrl, ModelOptionsData } from "../data-acsses/data-model-options";
import * as Ajv from "ajv";

export class RoutingCtrlWrapper implements ModelOptionsCtrl {
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
    data: ModelOptionsData;
    modelName: string;
    modelsName: string;
    modelSchema?: any;
    validation?;
    filterValidation?;
  }) {
    this.data = data;
    this.modelName = modelName;
    this.modelsName = modelsName;
    this.modelSchema = modelSchema; // todo

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
  }

  connectRouter = (router: Router) => {
    // todo...
  };

  _getAndValidIDs = (req, res, canBeEmpty = false) => {
    const id = req.body.ids;
    if (!id && !canBeEmpty) {
      res.status(400).send({ msg: "IDs are empty" });
      return false;
    }
    return id;
  };
  _getAndValidFilter = (req, res, canBeEmpty = false) => {
    const id = req.body.ids;
    if (!id && !canBeEmpty) {
      res.status(400).send({ msg: "ID is empty" });
      return false;
    }
    return id;
  };
  _getAndValidID = (req, res, canBeEmpty = false) => {
    const id = req.params.id;
    if (!id && !canBeEmpty) {
      res.status(400).send({ msg: "ID is empty" });
      return false;
    }
    return id;
  };
  _getAndValidModels = (req, res, canBeEmpty = false) => {
    const models = req.body;
    if (!models && !canBeEmpty) {
      res.status(400).send({ msg: "Not valid ID" });
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
  };

  _getAndValidModel = (req, res, canBeEmpty = false) => {
    const model = req.body;
    if (!model && !canBeEmpty) {
      res.status(400).send({ msg: "Not valid ID" });
      return false;
    } else if (!model) {
      return;
    }
    if (this._isModelValid(model, req, res) === false) {
      return false;
    }
    return model;
  };

  _isModelValid = (m, req, res) => {
    let err;
    if (this._validation) {
      err = this._validation(m);
    }
    if (err) {
      res.status(400).send({ msg: "Not valid Body data", err });
      return false;
    }
  };

  _failed = ({ err, msg, res }) => {
    res.status(400).send({ msg, err });
  };

  get = async (req: Request, res: Response) => {
    try {
      const id = this._getAndValidID(req, res);
      if (id == false) {
        return;
      }
      const result = await this.data.get(id);
      res.send(result);
    } catch (err) {
      this._failed({err, res, msg: "Failed to get data"});
    }
  };

  add = async (req: Request, res: Response) => {
    try {
      const model = this._getAndValidModel(req, res);
      if (model == false) {
        return;
      }
      await this.data.add(model);
      res.send({ msg: "added" });
    } catch (err) {
      this._failed({err, res, msg: "Failed to add data"});
    }
  };
  remove = async (req: Request, res: Response) => {
    try {
      const id = this._getAndValidID(req, res);
      if (id == false) {
        return;
      }
      await this.data.remove(id);
      res.send({ msg: "removed" });
    } catch (err) {
      this._failed({err, res, msg: "Failed to remove"});
    }
  };
  update = async (req: Request, res: Response) => {
    try {
      const model = this._getAndValidModel(req, res);
      if (model == false) {
        return;
      }
      await this.data.update(model);
      res.send({ msg: "updated" });
    } catch (err) {
      this._failed({err, res, msg: "Failed to update"});
    }
  };
  getMany = async (req: Request, res: Response) => {
    try {
      const ids = this._getAndValidIDs(req, res, true);
      if (!ids == false) {
        return;
      }
      const result = await this.data.getMany(ids);
      res.send(result);
    } catch (err) {
      this._failed({err, res, msg: "Failed to get data"});
    }
  };

  addMany = async (req: Request, res: Response) => {
    try {
      const models = this._getAndValidModels(req, res);
      if (models == false) {
        return;
      }
      await this.data.addMany(models);
      res.send({ msg: "added" });
    } catch (err) {
      this._failed({err, res, msg: "Failed to add data"});
    }
  };
  removeMany = async (req: Request, res: Response) => {
    try {
      const ids = this._getAndValidIDs(req, res);
      if (!ids) {
        return;
      }
      const result = await this.data.removeMany(ids);
      res.send(result);
    } catch (err) {
      this._failed({err, res, msg: "Failed to remove data"});
    }
  };
  getManyByFilter = async (req: Request, res: Response) => {
    try {
      const filter = this._getAndValidFilter(req, res);
      if (filter == false) {
        return;
      }
      await this.data.getManyByFilter(filter);
      res.send({ msg: "updated" });
    } catch (err) {
      this._failed({err, res, msg: "Failed to get by filter"});
    }
  };
}
