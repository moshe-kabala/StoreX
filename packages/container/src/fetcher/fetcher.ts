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
export class Fetcher extends Dispatcher {
  private __subscribers = new Set();
  private __needToLoad = true;
  private __is_already_subscribe = false;
  private __fetch;

  constructor({ fetch }) {
    super();
    this.__fetch = fetch;
  }

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
      setTimeout(this.fetch.bind(this));
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

  needToLoad = (fetchData?) => {
    this.__needToLoad = true;
    if (this.__subscribers.size) {
      this.fetch(fetchData);
    }
  };

  __updateSubscriber(arg?) {
    for (const func of this.__subscribers) {
      if (typeof func === "function") {
        func(arg);
      }
    }
  }

  fetch = async (fetchData?) => {
    try {
      this.isLoading = true;
      const data = await this.__fetch(fetchData);
      this.isLoading = false;
      this.__updateSubscriber(data);
    } finally {
      this.isLoading = false;
    }
  };
}
