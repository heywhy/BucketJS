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
/*eslint no-unused-vars: off*/
var EventManager = (function(window, undefined){
  /**
   * class EventManager
   *
   * its helps to manage any event that occurs during execution
   * of the app
   *
   * @private property _events
   * @private property _token
   * @public method listen
   * @public method trigger
   * @public method unListen
   *
   * @return void
   */
  var EventManager = function(){
    this._events = {};
    this._token = 0;
  };

  /**
   * listen method
   * it adds a listener to an event before it occurs
   *
   * @param string   // name of the event
   * @param function // the function that gets called when the event occurs
   * @param number   // token to use when unlistening to an event
   *
   * @return number
   */
  EventManager.prototype.listen = function(event, callback){
    if (!this._events[event]) {
      this._events[event] = [];
    }

    this._events[event].push({
      token: ++this._token,
      callback: callback
    });

    return this._token;
  };

  /**
   * Method trigger
   * this triggers an event informing all listeners related to the event
   *
   * @param string // name of the event that's occurring
   * @param array  // arguments to be passed to the listeners
   *
   * @return this
   */
  EventManager.prototype.trigger = function(event, arg){
    if (!this._events[event]) {
      return false;
    }

    var listeners = this._events[event];

    for (var id = 0, len = listeners.length; id < len; id++) {
      listeners[id].callback.apply(null, arg);
    }

    return this;
  };

  /**
   * unListen method
   *
   * it removes a listener from an event using the token given to it when
   * it was first attached to the event to occur, if the token
   * is registered to the event the token is return else self {EventManager::class}
   *
   * @param number
   *
   * @return this|number // EventManager|token
   */
  EventManager.prototype.unListen = function(token){
    for (var event in this._events) {
      if (this._events[event]) {
        var listeners = this._events[event];
        for (var id = 0, len = listeners.length; id < len; id++) {
          if (listeners[id].token === token) {
            listeners.splice(id, 1);

            return token;
          }
        }
      }
    }

    return this;
  };

  /**
   * toString method
   *
   * it gives a much more descriptive information when trying to output
   * an instantiated copy of it as a string
   *
   * @return string
   */
  EventManager.prototype.toString = function(){
    return "EventManager::class";
  };

  // we return the class
  return EventManager;
})(this);
