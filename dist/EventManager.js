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
 
(function(window, undefined){
  /**
   * class EventManager
   * its helps to manage any event occurs during execution
   * of the app
   *
   * @private property events
   * @public method listen
   * @public method trigger
   * @public method unListen
   * 
   * @return void
   */
  window.EventManager = function(){
    this.events = {};
  }
  
  /**
   * Method listen
   * it adds a listener to an event before it occurs
   *
   * @param string // name of the event
   * @param function // the function that gets called when the event occurs
   * @param number // token to use when unlistening to an event
   */
  EventManager.prototype.listen = function(event, callback){
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    var token = Date.now();
    
    this.events[event].push({
      token: token,
      callback: callback
    });
    
    return token;
  }
  
  /**
   * Method trigger
   * this triggers an event informing all listeners related to the event
   *
   * @param string
   * @param array // arguments passed to the listeners
   * @return self
   */
  EventManager.prototype.trigger = function(event, arg){
    if (!this.events[event]) {
      return false;
    }
    
    var listeners = this.events[event];
    
    for (var id = 0, len = listeners.length; id < len; id++) {
      listeners[id].callback.apply(null, arg);
    }
    
    return this;
  }
  
  /**
   * Method unListen
   * to remove a listener from an event using the token given to it when
   * it first started listening to the event to occur
   * 
   * @param number
   * @return self|number // EventManager|token
   */
  EventManager.prototype.unListen = function(token){
    for (var event in this.events) {
      if (this.events[event]) {
        var listeners = this.events[event];
        for (var id = 0, len = listeners.length; id < len; id++) {
          if (listeners[id].token === token) {
            listeners.splice(id, 1);
            
            return token;
          }
        }
      }
    }
    
    return this;
  }
  
  /**
   * Method toString
   */
  EventManager.prototype.toString = function(event, arg){
    return 'EventManager::class';
  }
  
})(this);