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
abstract class Fetcher extends Dispatcher {
    abstract loadData();
  
    subscribers = new Set();
    _needToLoad = true;
    _is_already_subscribe = false;
    
    @dispatch()
    _isLoading = false;
  
    subscribe = func => {
      if (
        this.subscribers.size == 0 &&
        !this._is_already_subscribe &&
        this["initAfterFirstSubscriber"]
      ) {
        this._is_already_subscribe = true;
        this["initAfterFirstSubscriber"]();
      }
  
      if (this.subscribers.size == 0 && this["onFirstSubscribe"]) {
        this["onFirstSubscribe"]();
      }
  
      this.subscribers.add(func);
      if (this._needToLoad) {
        setTimeout(this._loadData.bind(this));
      }
    };
  
    unsubscribe = func => {
      if (this.subscribers.size == 0) {
        return;
      }
      this.subscribers.delete(func);
      if (
        this.subscribers.size == 0 &&
        typeof this["onLastUnsubscribed"] == "function"
      ) {
        this["onLastUnsubscribed"]();
      }
    };
  
    needToLoad = (isUpdate?) => {
      this._needToLoad = true;
      if (this.subscribers.size) {
        setTimeout(this._loadData.bind(this, isUpdate));
      }
    };
  
    async _loadData(isUpdate?) {
      try {
        this._isLoading = true;
        await this.loadData();
      } finally {
        this._isLoading = false;
      }
    }
  }