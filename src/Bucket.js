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
   * Clasz Namespace
   * class that helps in keeping every state of the contexts
   *
   * @private property _Tree {Tree}
   * @private property _bucket {Object}
   *
   * @private method _handle
   * @public method get
   * @public method add
   * @public method toString
   * 
   * @param Object {Tree}
   * @return void
   */
  var Namespace = function(tree){
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
   * Method add
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
        if (contexts[i].class.length === 0) {
          contexts[i].class = new contexts[i].class;
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
    endcode = ");})()";
    
    for (var i = 0; i < len; i++) {
      codes += "args["+i+"],";
    }
    codes = codes.replace(/,$/, '') + endcode;
    
    return eval(codes);
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
  
  /**
   * Class Tree
   * this helps in building a cute tree (Binary Tree kinda)
   * to help process dependencies loading in the right order
   *
   * @private property root
   * @private property bucket
   * @private property searched {array}
   *
   * @public method setRoot
   * @public method clear
   * @public method add
   * @public method setBucket
   * @public method traverse
   * @public method process
   * @public method toString
   *
   * @return void
   */
  var Tree = function(){
    this.root = null;
    this.searched = [];
  }
  
  /**
   * Method traverse
   * it helps in traversing every nodes
   *
   * @param function
   * @return void
   */
  Tree.prototype.traverse = function(callback){
    /**
     * We'll define a walk function that we can call recursively on every node
     */
    function walk(node) {
      callback(node);
      node.children.forEach(walk);
    }

    walk(this.root);
  }
  
  /**
   * Method add
   * for adding a child to a parent node
   *
   * @param object
   * @return void
   */
  Tree.prototype.add = function(value, parentValue){
    var newNode;
    if (typeof value === 'object') {
      newNode = value;
    } else {
      newNode = {
        value: value,
        children: []
      };
    }
    
    // If there is no root, just set it to the new node.
    if (this.root === null) {
      this.root = newNode;
      return;
    }

    // Otherwise traverse the entire tree and find a node with a matching value
    // and add the new node to its children.
    this.traverse(function(node) {
      if (node.value === parentValue) {
        node.children.push(newNode);
      }
    });
  }
  
  /**
   * Method setBucket
   * sets the bucket where the children gets fetched
   * return void
   */
  Tree.prototype.setBucket = function(bucket){
    this.bucket = bucket;
  }
  
  /**
   * Method setRoot
   * sets the root of the tree to be built
   * 
   * @param object
   * @return void
   */
  Tree.prototype.setRoot = function(root){
    this.root = {
      value: root.id,
      context: root,
      children: []
    };
  }
  
  /**
   * Method process
   * it proccesses every node by adding them to their respective parents
   *
   * @param object
   * @return void
   */
  Tree.prototype.process = function(child){
    var parent;
    
    if (child !== undefined) {
      parent = child;
      parent.context = child;
    } else {parent = this.root}
    
    var dependencies = parent.context.dependencies, dontLoad = [];
    
    if (dependencies !== null) {
      require(dependencies);
    
      for (var i = 0, len = dependencies.length; i < len; i++) {
        var id = backslash(dependencies[i]);
        
        var context = this.bucket[id];
        context.value = context.id
        context.children = [];
        this.searched.push(context);
        this.add(context, parent.value);
      }
    }
    
    for (i = 0, len = this.searched.length - 1; i <= len; i++) {
      var contexty = this.searched.shift();
      --len;
      this.process(contexty);
    }
  }
  
  /**
   * Method clear
   * it clears the tree by setting the root to null
   * @return void
   */
  Tree.prototype.clear = function(){
    this.root = null;
  }
  
  /**
   * Method toString
   * so that it can give a much more descriptive information
   * when trying to output it as a string
   * @return void
   */
  Tree.prototype.toString = function(){
    return 'Tree::class';
  }
  
  
  var ajax = new XMLHttpRequest(), codes = '',
  HOST = location.protocol + '//' + location.host;
  var backslash = function(string) {
    return string.replace(/\//g, '\\');
  };
  
  /**
   * Function process
   * Fetches the file been passed to it and attaches
   * its content to the {var codes}
   *
   * @param string
   * @return void
   */
  function process(file) {
    if (require.cache[file] !== undefined) {
      codes += "\n"+require.cache[file]+"";
      return;
    }
    
    var requestError = false,
    callback = function(event) {
      if (ajax.readyState === 4 && ajax.status === 200) {
        codes += "\n"+ajax.responseText+"";
        require.cache[file] = ajax.responseText;
        requestError = false;
      } else {
        requestError = true;
      }
    }, url = HOST+file;
    
    ajax.onreadystatechange = callback;
        
    ajax.open('GET', url, false);
    ajax.send(null);
        
    if (requestError) {
      throw new Error(url+": "+ajax.statusText);
    }
  }
    
  /**
   * Function require
   * it fetches files from the server if not on the page already.
   * delegating the processing of the files to the process function 
   *
   * @param array // array of files to include
   * @return void
   */
  var require = function(files) {
    if (files === undefined || !Array.isArray(files)) {
      throw new TypeError('require expects first param to be an array.')
    }
    
    if (require.cache === undefined) {
      require.cache = {};
    }
    
    var config = require.config;
    
    for (var id = 0, len = files.length; id < len; id++) {
      var file = files[id];
      
      /**
       * we check if filters is|are defined so that we can match them to the
       * right path specified by the filter
       */
      if (require.config.filters !== undefined) {
        for (var filter in config.filters) {
          var regex = new RegExp("^("+filter+")", "i"),
          src = config.filters[filter].replace(/^\//, '').replace(/\/$/, '');
          
          if (regex.test(file)) {
            file = file.replace(regex, '/'+src);
            break;
          }
        }
      }
      
      if (file.match(/(\.js)$/i) === null) {
        file += '.js'
      }
      
      process(file);
      require[file] = true;
    }
        
    eval(codes);
    codes = '';
  }
  
  /**
   * static property config
   * @var object
   */
  require.config = {base: 'app'};
  
  /**
   * static require.setConfig
   * @param object
   * @return void
   */
  require.setConfig = function(config) {
    for (var id in config) {
      id = id.toLowerCase();
      require.config[id] = config[id]
    }
  }
  
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
  Bucket._space = new Namespace(new Tree());
  
  /**
   * @var function // an alias to Bucket
   */
  window.B = Bucket;
  
})(window)