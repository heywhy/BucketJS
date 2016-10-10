/**
 * MIT License
 *
 * Copyright (c) 2016 atanda rasheed
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/*eslint no-undef: off*/
/*eslint no-unused-vars: off*/
// @var function
var Cache = (function(window, undefined){
  /**
   * @var number
   * to hold the number of instantiated Cache object so that
   * the data each stores doesn't conflicts with other object of Cache
   */
  var instantiated = 0;

  /**
   * class Cache
   *
   * Used to cache the contents of a file after it has been loaded
   * by the Load.js
   * After a file has been loaded for the first time it caches the files,
   * instead of the file to be fetched from the server it is
   * fetched from the browser to reduce load time of the app and it
   * can be reused by other parts of the app
   *
   * @private property _storage
   * @public property length
   * @public property id
   *
   * @private method _log
   * @private method _get
   * @private method _set
   *
   * @public method store
   * @public method retrieve
   * @public method delete
   * @public method consume
   * @public method clear
   * @public method getAll
   * @public method toString
   */
  var Cache = function(){
    this.length = 0;
    this._storage = localStorage || {};
    this.id = instantiated++;
    this._log();
  };

  /**
   * _log method
   * its stores the data mapped to the key been passed to it
   *
   * @param string|number
   * @param string|number|function|object
   *
   * @return void
   */
  Cache.prototype._log = function(key, value){
    var CacheLogger = JSON.parse(this._get("CacheLogger"));

    if (CacheLogger != null) {
      if (CacheLogger.CacheLogger[this.id] == null) {
        CacheLogger.CacheLogger[this.id] = {};
      }

      CacheLogger.CacheLogger[this.id][key] = value;
      this._set("CacheLogger", JSON.stringify(CacheLogger));
    } else {
      this._set("CacheLogger", JSON.stringify({"CacheLogger": []}));

      return;
    }
  };

  /**
   * store method
   * it takes a key and the contents, mapping the content to the
   * key for easy access
   *
   * @param string|number
   * @param string|number|function|object
   *
   * @return boolean
   */
  Cache.prototype.store = function(key, content){
    var item = JSON.stringify({
      key: key,
      value: content
    });

    this._log(key, item);
    ++this.length;

    return true;
  };

  /**
   * retrieve method
   * returns the content mapped to the key
   *
   * @param string|number
   *
   * @return object
   */
  Cache.prototype.retrieve = function(key){
    if (key == null) {
      return null;
    }
    var item = null ,
      CacheLogger = JSON.parse(this._get("CacheLogger")).CacheLogger;

    if (CacheLogger[this.id][key] != null) {
      item = CacheLogger[this.id][key];
      return JSON.parse(item);
    }

    return item;
  };

  /**
   * delete method
   * it removes the content mapped to the given key and also the key
   *
   * @param string|number
   *
   * @return boolean
   */
  Cache.prototype.delete = function(key){
    --this.length;

    var CacheLogger = JSON.parse(this._get("CacheLogger"));
    if (CacheLogger.CacheLogger[this.id] != null) {
      delete CacheLogger.CacheLogger[this.id][key];
      this._set("CacheLogger", JSON.stringify(CacheLogger));

      return true;
    }

    return false;
  };

  /**
   * _set method
   * stores the value mapped to the given key
   *
   * @param string|number
   * @param string|number|function|object
   *
   * @return void
   */
  Cache.prototype._set = function(key, value){
    this._storage.setItem(key, value);
  };

  /**
   * _get method
   * returns the item mapped to the given key
   *
   * @param string|number
   *
   * @return string
   */
  Cache.prototype._get = function(key){
    return this._storage.getItem(key);
  };

  /**
   * consume method
   * it returns the content and then deletes it from the store
   *
   * @param string|number
   *
   * @return object
   */
  Cache.prototype.consume = function(key){
    var item = this.retrieve(key);
    this.delete(key);

    return item;
  };

  /**
   * clear method
   * clears the store
   *
   * @return boolean
   */
  Cache.prototype.clear = function(){
    var CacheLogger = JSON.parse(this._get("CacheLogger")),
      items = CacheLogger.CacheLogger[this.id];
    for (var item in items) {
      this.delete(item);
    }
    this.length = 0;

    return true;
  };

  /**
   * getAll method
   * returns all item stored in the store
   *
   * @return object
   */
  Cache.prototype.getAll = function(){
    var all = JSON.parse(this._get("CacheLogger"));

    return all.CacheLogger[this.id];
  };

  /**
   * toString method
   * returns a descriptive message about the object
   *
   * @return string
   */
  Cache.prototype.toString = function(){
    return "Cache::class";
  };

  return Cache;
})(this);
