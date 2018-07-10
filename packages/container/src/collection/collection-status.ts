import { Dispatcher, dispatch } from "@storex/core";

export class CollectionStatus extends Dispatcher {
  lastUpdate;
  filter?;
  isLoading = false;
  statusDir = {};
  pagination?;

  @dispatch()
  updateItemsStatus(itemsStatus) {
    Object.keys(itemsStatus).forEach(id => {
      this.statusDir[id] = itemsStatus[id];
    });
  }

  @dispatch()
  removeStatus(id) {
    delete this.statusDir[id];
  }
}
