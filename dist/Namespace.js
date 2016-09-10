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
   * Class Namespace
   * class that helps in keeping every state of the contexts
   * some events are triggered during the excution of the app
   * Events:
   *   add,
   *   create
   *
   * The add event gets triggered when a new namespaceid gets
   * added with its context, to listen to the event you make a call
   * to Bucket.listen method passing the id of the event prefixing the
   * event id with namespace, including the namespace id and the
   * context gets passed to it e.g.
   * assuming we listening to when App/Welcome context gets added
   * Bucket.listen('namespace.add.App/Welcome', function(context){
   *   context.prototype.log = new Logger();
   * });
   * 
   * The create event gets triggered when the context gets instantiated
   * The rules above applies to listening to the event, just that the 
   * name of the event changes from add to create, and the instantiated
   * copy gets passed to the listener e.g.
   * Bucket.listen('namespace.create.App/Welcome', function(context){
   *   context.response = 'Hello World'
   * });
   *
   * @private property _Tree {Tree}
   * @private property _eventManger {EventManager}
   * @private property _bucket {Object}
   *
   * @private method _handle
   * @public method get
   * @public method add
   * @public method toString
   * 
   * @param object {Tree}
   * @return void
   */
  window.Namespace = function(tree, eventManager){
    this._Tree = tree;
    this._eventManager = eventManager;
    
    if (this._Tree === undefined) {
      this._Tree = new Tree();
    }
    
    if (!(this._Tree instanceof Tree)) {
      throw new Error("class Namespace constructor expects param to be an instance of Tree");
    }
    
    if (this._eventManager === undefined) {
      this._eventManager = new EventManager();
    }
    
    if (!(this._eventManager instanceof EventManager)) {
      throw new Error("class Namespace constructor expects second param to be an instance of EventManager");
    }
    
    this._bucket = {};
  }
  
  /**
   * Method add
   * adds the new context to the existing bucket
   *
   * @param array
   * @param function
   * @return void
   */
  Namespace.prototype.add = function(id, context) {
    if (!Array.isArray(id)) {
      throw new Error('method Namespace::add expects first param to be of type array');
    }
    
    if (typeof context !== 'function') {
      throw new Error('method Namespace::add expects second param to be of type function');
    }
    
    /**
     * we replace every forwardslash found with a backslash
     * e.g. App/Core/Auth => App\Core\Auth
     */
    var contextid = backslash(id[0]), dependencies = id[1] || null;
    
    /**
     * we add a toString method to every context saved,
     * so that it can give a much more descriptive information
     * when trying to output it as a string
     */
    context.prototype.toString = function(){
      return contextid+"::class";
    }
    
    this._bucket[contextid] = {
      id: contextid,
      'class': context,
      dependencies: dependencies
    };
    
    // triggers event add.namespaceid e.g. add.App\Welcome
    this._eventManager.trigger('add.'+id[0], [context]);
  }
  
  /**
   * Method get
   *
   * gets an object of the context id with all depencdencies loaded
   * and instantiated, as parameters if defined.
   *
   * @param string {id of the context}
   * @return object
   */
  Namespace.prototype.get = function(id) {
    /**
     * we backslash every forwardslash so as to match an id, because
     * every context id having a forwardslash has ben replaced with
     * a backslash before saving them in the bucket
     */
    var id = backslash(id);
    
    // if the id hasnt been saved, we retyrn a null instead of undefined
     
    if (this._bucket[id] === undefined) {
      return null;
    }
    
    /**
     * if the context has some dependencies, we build up a tree so that
     * we can tranverse the nodes, instantiate and pass them as parameters
     * to the context that needs them.
     */
    if (this._bucket[id].dependencies !== undefined) {
      // we set the root
      this._Tree.setRoot(this._bucket[id]);
      // we set the bucket where every nodes get fetched
      this._Tree.setBucket(this._bucket);
      // the children of each nodes gets added
      this._Tree.process();
      var nodes = [], contexts = [], arg = [];
      
      /**
       * we have to to traverse every nodes
       * so that they can be worked 0n 
       */
      this._Tree.traverse(function(node){
        nodes.push(node.value);
        contexts.push(node.context)
      });
      
      for (var i = nodes.length - 1; i > -1; --i) {
        id = forwardslash(contexts[i].id);
        
        if (contexts[i].class.length === 0) {
          contexts[i].class = new contexts[i].class;
          // triggers event create.class
          this._eventManager.trigger('create.'+id, [contexts[i].class]);
          
        } else {
          var codes = "(function(){return new contexts[i].class(", endcode = ");})()";
          
          for (var j = 0, len = contexts[i].dependencies.length; j < len; j++) {
            var hey = contexts[i].dependencies, kick = backslash(hey[j]),
            index = nodes.indexOf(kick), funcLen = contexts[i].class.length;
            
            if (typeof contexts[index].class === 'function') {
              contexts[index].class = this._handle(contexts[index], arg);
            }
            
            arg.push(contexts[index].class);
          }
          
          for (var k = 0; k < funcLen; k++) {
            codes += "arg["+k+"],";
          }
          
          codes = codes.replace(/,$/, '') + endcode;
          
          contexts[i].class = eval(codes);
          
          // triggers event create.class
          this._eventManager.trigger('create.'+id, [contexts[i].class]);
          
          for (k = 0; k < funcLen; k++) {
            arg.shift();
          }
        }
      }
      
      contexts = contexts[0].class;
      // we clean the tree up
      this._Tree.clear();
      
      return contexts;
    }
        
    return new this._bucket[id].class;
  }
  
  /**
   * Method _handle
   * it is used to handle a a dependency which is of
   * type function
   *
   * @param function
   * @param array // where the remaining contexts will be fetched from
   * @return object
   */
  Namespace.prototype._handle = function(klass, bucket){
    var len = klass.dependencies.length,
    args = bucket.splice(0, len), codes = "(function(){return new klass.class(",
    endcode = ");})()", id = forwardslash(klass.id);
    
    for (var i = 0; i < len; i++) {
      codes += "args["+i+"],";
    }
    codes = codes.replace(/,$/, '') + endcode;
    
    var context = eval(codes);
    // triggers event create.class
    this._eventManager.trigger('create.'+id, [context]);
    
    return context;
  }
    
  /**
   * Method toString
   * we add a toString method so that it can give a much more descriptive information
   * when trying to output it as a string
   *
   * @return string
   */
  Namespace.prototype.toString = function(){
    return 'Namespace::class';
  }
  
})(window)