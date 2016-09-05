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
   * Function Bucket
   * its a basic facade to the underlying core of the
   * library
   * 
   * @return void|object
   */
    
  window.Bucket = function(id, context){
    if (typeof id === 'string') {
      require([id]);
      
      return Bucket._space.get(id);
    }
    else if (Array.isArray(id) && typeof context === 'function') {
      Bucket._space.add(id, context);
    }
    else if (typeof id === 'object') {
      require.setConfig(id);
    }
  }
  
  /**
   * static property _space
   * @property object
   */
  Bucket._space = new Namespace(new Tree(), new EventManager());
  
  /**
   *
   */
  Bucket.eventManager = new EventManager();
  /**
   * static method listen
   * it adds a listener to an event
   * @param string // name of the event to listen to
   * @param function // the funct8on that gets excuted when the event occurs
   * @return number // a token assigned to the listener
   */
  Bucket.listen = function(eventid, callback){
    var event = eventid.split('.'), token;
    if (event[0].toLowerCase() === 'require') {
      event = event.splice(1).join('.')
      token = 'require'+require.event.listen(event, callback);
    } else if (event[0].toLowerCase() === 'namespace') {
      event = event.splice(1).join('.');
      token = 'namespace'+Bucket._space._eventManager.listen(event, callback);
    } else {
      token = Bucket.eventManager.listen(eventid, callback);
    }
    
    return token;
  }
  
  /**
   * static method trigger
   * triggers an event, telling it listeners that an event has occured
   * @param string
   * @param array
   * @return void
   */
  Bucket.trigger = function(event, arg){
    Bucket.eventManager.trigger(event, arg);
  }
  
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
      token = parseInt(token.replace(/^(namespace)/i, ''));
      reply = Bucket._space._eventManager.unListen(token);
    } else if (token.match(/^(require)/i) !== null) {
      token = parseInt(token.replace(/^(require)/i, ''));
      reply = require.event.unListen(token);
    } else {
      reply = Bucket.eventManager.unListen(token);
    }
    
    return reply;
  }
  
  /**
   * static method addProperty
   * it adds new properties to the prototype of the context
   * @param function
   * @param object
   * @return function // the passed context
   */
  Bucket.addProperty = function(context, methods){
    if (typeof context !== 'function') {
      throw new Error('Bucket::addMethods expects first param to be function.');
    }
    
    for (var i in methods) {
      context.prototype[i] = methods[i];
    }
    
    return context;
  }
  
  /**
   * @var function // an alias to Bucket
   */
  window.B = Bucket;
})(window)