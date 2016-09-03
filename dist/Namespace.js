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
   * function Namespace
   *
   * class that helps in keeping every state of the contexts
   *
   * @param Object {Tree}
   * @return void
   */
  window.Namespace = function(tree){
    this._Tree = tree;
    
    if (this._Tree === undefined) {
      this._Tree = new Tree();
    }
    
    if (!(this._Tree instanceof Tree)) {
      throw new TypeError("class Namespace constructor expects param to be an instance of Tree");
    }
        
    this._bucket = {};
  }
  
  /**
   * method add
   *
   * adds the new context to the existing bucket
   *
   * @param array
   * @param function
   * @return void
   */
  Namespace.prototype.add = function(id, context) {
    if (!Array.isArray(id)) {
      throw new TypeError('method Namespace::add expects first param to be of type array');
    }
    
    if (typeof context !== 'function') {
      throw new TypeError('method Namespace::add expects second param to be of type function');
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
  }
  
  /**
   * method get
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
        if (contexts[i].class.length === 0) {
          contexts[i].class = new contexts[i].class;
        } else {
          var codes = "(function(){return new contexts[i].class(", endcode = ");})()";
          
          for (var j = 0, len = contexts[i].dependencies.length; j < len; j++) {
            var hey = contexts[i].dependencies, kick = backslash(hey[j]),
            index = nodes.indexOf(kick), funcLen = contexts[i].class.length;
            
            if (typeof contexts[index].class === 'function') {
              contexts[index].class = this.handle(contexts[index], arg);
            }
            
            arg.push(contexts[index].class);
          }
          
          for (var k = 0; k < funcLen; k++) {
            codes += "arg["+k+"],";
          }
          
          codes = codes.replace(/,$/, '') + endcode;
          
          contexts[i].class = eval(codes);
          
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
   * method handle
   *
   * it is used to handle a a dependency which is of
   * type function
   *
   * @param function
   * @param array // where the remaining contexts will be fetched from
   * @return object
   */
  Namespace.prototype.handle = function(klass, bucket){
    var len = klass.dependencies.length,
    args = bucket.splice(0, len), codes = "(function(){return new klass.class(",
    endcode = ");})()";
    alert(bucket)
    
    for (var i = 0; i < len; i++) {
      codes += "args["+i+"],";
    }
    codes = codes.replace(/,$/, '') + endcode;
    
    return eval(codes);
  }
    
  /**
   * method toString
   * 
   * we add a toString method so that it can give a much more descriptive information
   * when trying to output it as a string
   *
   * @return string
   */
  Namespace.prototype.toString = function(){
    return 'Namespace::class';
  }
  
})(window)