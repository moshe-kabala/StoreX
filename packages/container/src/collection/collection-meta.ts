import { Dispatcher, dispatch, DispatcherArgs } from "@storex/core";

export interface CollectionMetaArgs extends DispatcherArgs {
  id?: number | string;
  name?: string;
  columnMeta?;
  itemToId;
}

export class CollectionMeta extends Dispatcher {
  id;
  name;
  jsonSchema;
  itemToId: Function;
  constructor(args: CollectionMetaArgs) {
    super();
    if (!args || typeof args.itemToId !== "function") {
      throw new Error("You must to send itemToId to CollectionMeta")
    } 
    this.id = args.id;
    this.name = args.name;
    this.itemToId = args.itemToId;
  }
}
