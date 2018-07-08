import { Store, update } from "@storex/core";

export class CollectionStatus extends Store {
  lastUpdate;
  filter?;
  isLoading = false;
  statusDir = {};
  pagination?;

  @update()
  updateItemsStatus(itemsStatus) {
    Object.keys(itemsStatus).forEach(id => {
      this.statusDir[id] = itemsStatus[id];
    });
  }

  @update()
  removeStatus(id) {
    delete this.statusDir[id];
  }
}
