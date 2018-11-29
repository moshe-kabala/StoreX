import { FilterData } from "../filter-data/filter-data";
import { Router, Request, Response } from "express";

export type idType = string | number;
export type idsType = idType[];

export interface ModelOptionsData<T = any> {
  get(id: idType);
  add(data: T);
  remove(id: idType);
  update(data: T);
  getMany(ids?: idsType);
  addMany(data: T[]);
  removeMany(ids: idsType);
  getManyByFilter(filter: FilterData);
}

export interface ModelOptionsCtrl {
  get(req: Request, res: Response);
  add(req: Request, res: Response);
  remove(req: Request, res: Response);
  update(req: Request, res: Response);
  getMany(req: Request, res: Response);
  addMany(req: Request, res: Response);
  removeMany(req: Request, res: Response);
  getManyByFilter(req: Request, res: Response);
}
