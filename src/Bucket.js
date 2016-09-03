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
  
  /**
   * function Tree
   * 
   * this helps in building a cute tree (Binary Tree kinda)
   * to help process dependencies loading in the right order
   *
   * @return void
   */
  var Tree = function(){
    this.root = null;
    this.searched = [];
  }
  
  /**
   * method traverse
   *
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
   * method add
   *
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
   * method setBucket
   *
   * sets the bucket where the children gets fetched
   * return void
   */
  Tree.prototype.setBucket = function(bucket){
    this.bucket = bucket;
  }
  
  /**
   * method setRoot
   *
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
   * method process
   * 
   * it proccesses every node by ading them to their respective parents
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
   * method clear
   * it clears the tree
   *
   * @return void
   */
  Tree.prototype.clear = function(){
    this.root = null;
  }
  
  /**
   * method toString
   *
   * so that it can give a much more descriptive information
   * when trying to output it as a string
   * @return void
   */
  Tree.prototype.toString = function(){
    return 'Tree::class';
  }
  
  
  var ajax = new XMLHttpRequest(), codes = '', baseUrl = 'App/',
  HOST = location.protocol + '//' + location.host, appRegex = /^app\//i;
  
  var backslash = function(string) {
    return string.replace(/\//g, '\\');
  };
  
  /**
   * function process
   * 
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
    }, url = HOST+'/'+baseUrl;
    
    ajax.onreadystatechange = callback;
        
    ajax.open('GET', url+file, false);
    ajax.send(null);
        
    if (requestError) {
      throw new Error(url+file+": "+ajax.statusText);
    }
  }
    
  /**
   * function require
   * 
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
    
    for (var id in files) {
      var file = files[id].replace(/^(\.\/)/, '');
      
      if (file.match(/(\.js)$/i) === null) {
        file = file+'.js'
      }
      
      if (file.search(appRegex) > -1) {
        file = file.replace(appRegex, '');
      }
      
      process(file);
      require[baseUrl+file] = true;
    }
        
    eval(codes);
    codes = '';
  }
    
  /**
   * function require.setBase
   *
   * it sets the base directory where the files should
   * be loaded from
   *
   * @param string
   * @return void
   */
  require.setBase = function(directory){
    baseUrl = directory;
  }
  
  /**
   * function require.getBase
   * 
   * it returns the base directory where files are loaded
   * from
   *
   * @return string
   */
  require.getBase = function(){
    return baseUrl;
  }
    
  /**
   * function require.attach
   * 
   * it adds a new path to the base directory
   * e.g baseUrl = 'src/core'
   * require.attach('/auth');
   * console.log(baseUrl); => src/core/auth
   * 
   * @param string
   * @return void
   */
  require.attach = function(path){
    baseUrl += path;
  }
  
  /**
   * function requre.detach
   *
   * removes a subpath from the base directory
   * e.g. baseUrl = 'src/core/auth'
   * require.detach('/core');
   * console.log(baseUrl); => src/auth
   *
   * @param string
   * @return void
   */
  require.detach = function(path){
    if (baseUrl.match(path) !== null) {
      baseUrl = baseUrl.replace(path, '');
    }
  }
  
  /**
   * function require.loaded
   * 
   * used to verify if a file has been loaded
   *
   * @param string
   * @return bool
   */
  require.loaded = function(file){
    if (require[file] === true) {
      return true;
    }
    
    return false;
  }
  
  /**
   * function Bucket
   *
   * its a basic facade to the underlying jigs
   * 
   * @return void|object
   */
    
  window.Bucket = function(id, context){
    if (typeof id === 'string') {
      if (Bucket._config !== undefined) {
        if (Bucket._config.fetch) {
          if (Bucket._config.base !== undefined && Bucket._config.base !== null) {
            require.setBase(Bucket._config.base);
          }
          require([id]);
        }
      }
      
      return Bucket._space.get(id);
    }
    else if (Array.isArray(id) && typeof context === 'function') {
      Bucket._space.add(id, context);
    }
    else if (typeof id === 'object') {
      Bucket._config = id;
    }
  }
    
  Bucket._space = new Namespace(new Tree());
  
  Bucket._config = {
    fetch: false,
    base: null
  };
  
  window.B = Bucket;
})(window)