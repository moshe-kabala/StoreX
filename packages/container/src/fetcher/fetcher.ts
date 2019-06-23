import { Dispatcher, dispatch } from "@storex/core";

// todo adding get function, add testing

/**
 * @abstract
 * @class Fetcher
 * @extends {Dispatcher}
 *
 * Help to get data once for multi components
 * every time that the data updated you need to call needToUpdate function
 * also there is some HOOKS
 * @hooks (using by creating a function on your class with same as the desired hook name)
 *
 * @initAfterFirstSubscriber calling ONLY once after the first subscriber
 * @onFirstSubscribe calling every time after the first subscriber
 * @onLastUnsubscribed calling every time after the last unsubscribed
 *
 */
export abstract class Fetcher extends Dispatcher {
  abstract loadData();

  private __subscribers = new Set();
  __needToLoad = true;
  __is_already_subscribe = false;

  @dispatch()
  isLoading = false;

  subscribe = func => {
    if (
      this.__subscribers.size == 0 &&
      !this.__is_already_subscribe &&
      this["initAfterFirstSubscriber"]
    ) {
      this.__is_already_subscribe = true;
      this["initAfterFirstSubscriber"]();
    }

    if (this.__subscribers.size == 0 && this["onFirstSubscribe"]) {
      this["onFirstSubscribe"]();
    }

    this.__subscribers.add(func);
    if (this.__needToLoad) {
      setTimeout(this._loadData.bind(this));
    }
  };

  unsubscribe = func => {
    if (this.__subscribers.size == 0) {
      return;
    }
    this.__subscribers.delete(func);
    if (
      this.__subscribers.size == 0 &&
      typeof this["onLastUnsubscribed"] == "function"
    ) {
      this["onLastUnsubscribed"]();
    }
  };

  needToLoad = (isUpdate?) => {
    this.__needToLoad = true;
    if (this.__subscribers.size) {
      setTimeout(this._loadData.bind(this, isUpdate));
    }
  };

  __updateSubscriber() {
    for(const func of this.__subscribers) {
      if (typeof func === "function" ) {
        func();
      }
    }
  }

  async _loadData(isUpdate?) {
    try {
      this.isLoading = true;
      await this.loadData();
      this.__updateSubscriber()
    } finally {
      this.isLoading = false;
    }
  }
}
