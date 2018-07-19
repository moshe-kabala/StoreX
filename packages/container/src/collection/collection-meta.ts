import { Dispatcher, dispatch, DispatcherArgs } from "@storex/core";

export interface CollectionMetaArgs extends DispatcherArgs {
  id?: number | string;
  name?: string;
  schema?;
  itemToId;
}

export class CollectionMeta extends Dispatcher {
  id;
  name;
  schema;
  itemToId: Function;
  length: number;
  constructor(args: CollectionMetaArgs) {
    super();
    if (!args || typeof args.itemToId !== "function") {
      throw new Error("You must to send itemToId to CollectionMeta")
    } 
    this.id = args.id;
    this.name = args.name;
    this.schema = args.schema;
    this.itemToId = args.itemToId;
  }
  setOptions(key, options) {

  }
  getOptions(key) {

  }
}
