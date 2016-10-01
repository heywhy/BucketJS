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
var Bucket = (function(window, undefined){
  // @var object {Namespace}
  var Space = new Namespace(new Tree(), new EventManager()),
    // @var object {EventManager}
    Event = new EventManager();

  /**
   * Function Bucket
   * its a basic facade to the underlying core of the
   * library
   *
   * @return void|object
   */

  var Bucket = function(id, context){
    if (typeof id === "string" && context === undefined) {
      Load([id]);
      return Space.get(id);
    }
    else if (Array.isArray(id) && typeof context === "function") {
      Space.add(id, context);
    }
    else if (typeof id === "object") {
      Load.setConfig(id);
    }
  };

  /**
   * static method listen
   * it adds a listener to an event
   *
   * @param string // name of the event to listen to
   * @param function // the funct8on that gets excuted when the event occurs
   *
   *  @return number // a token assigned to the listener
   */
  Bucket.listen = function(eventid, callback){
    var event = eventid.split("."), token;
    if (event[0].toLowerCase() === "load") {
      event = event.splice(1).join(".");
      token = "load" + Load.listen(event, callback);
    } else if (event[0].toLowerCase() === "namespace") {
      event = event.splice(1).join(".");
      token = "namespace" + Space.listen(event, callback);
    } else {
      token = Event.listen(eventid, callback);
    }

    return token;
  };

  /**
   * static method trigger
   * triggers an event, telling it listeners that an event has occured
   * @param string
   * @param array
   * @return void
   */
  Bucket.trigger = function(event, arg){
    Event.trigger(event, arg);
  };

  /**
   * static method unListen
   * removes a listener from its parent
   *
   * @param string
   * @return string
   */
  Bucket.unListen = function(token){
    var reply;
    if (token.match(/^(namespace)/i) !== null) {
      token = parseInt(token.replace(/^(namespace)/i, ""));
      reply = Space.unListen(token);
    } else if (token.match(/^(load)/i) !== null) {
      token = parseInt(token.replace(/^(require)/i, ""));
      reply = Load.unListen(token);
    } else {
      reply = Event.unListen(token);
    }

    return reply;
  };

  /**
   * static method burstCache
   * it bursts the cache system use by Load
   *
   * @return boolean
   */
  Bucket.burstCache = function(){
    return Load.burstCache();
  };

  /**
   * static method burstAllCache
   * deletes every property of object CacheLogger
   *
   * @return bool
   */
  Bucket.burstAllCache = function(){
    localStorage.removeItem("CacheLogger");
    localStorage.setItem("CacheLogger", JSON.stringify({"CacheLogger": []}));
  };

  /**
   * static method getCacheSystem
   *
   * @return object {Cache}
   */
  Bucket.getCacheSystem =  function(){
    return new Cache();
  };

  /**
   * static method load
   * loads a file from the server and evaluates it
   *
   * @param string|array
   *
   * @return void
   */
  Bucket.load = function(files){
    if (typeof files == "string") {
      files = [files];
    }

    return Load.require(files);
  };

  /**
   * @var function {Bucket}
   * an alias to bucket for conviniences
   */
  window.B = Bucket;

  return Bucket;
})(this);
