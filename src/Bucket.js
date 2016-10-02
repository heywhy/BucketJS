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
  var Tree = (function(){
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
      this._root = null;
      this._searched = [];
      this._bucket = null;
    };

    /**
     * traverse method
     * it traverses every nodes on the tree
     *
     * @param function
     *
     * @return void
     */
    Tree.prototype.traverse = function(callback){
      // We'll define a walk function that we can call recursively on every node
      function walk(node) {
        callback(node);
        node.children.forEach(walk);
      }

      walk(this._root);
    };

    /**
     * add method
     * it adds a child node to its parent node
     *
     * @param object
     * @param string
     *
     * @return void
     */
    Tree.prototype.add = function(value, parentValue){
      var newNode;
      if (typeof value === "object") {
        newNode = value;
      } else {
        newNode = {
          value: value,
          children: []
        };
      }

      // If there is no root, just set it to the new node.
      if (this._root === null) {
        this._root = newNode;

        return;
      }

      // Otherwise traverse the entire tree and find a node with a matching value
      // and add the new node to its children.
      this.traverse(function(node) {
        if (node.value === parentValue) {
          node.children.push(newNode);
        }
      });
    };

    /**
     * setBucket method
     * sets the bucket where the children gets fetched
     *
     * @param object {Namespace::_bucket}
     *
     * @return void
     */
    Tree.prototype.setBucket = function(bucket){
      this._bucket = bucket;
    };

    /**
     * setRoot method
     * sets the root of the tree to be built
     *
     * @param object
     *
     * @return void
     */
    Tree.prototype.setRoot = function(root){
      root = root();
      this._root = {
        value: root.id,
        context: root,
        children: []
      };
    };

    /**
     * process method
     * it proccesses every node, adding them to their respective parents
     * by making call to the add method
     *
     * @param object
     *
     * @return void
     */
    Tree.prototype.process = function(child){
      var parent;

      if (child !== undefined) {
        parent = child;
        parent.context = child;
      } else {parent = this._root;}

      var dependencies = parent.context.dependencies;

      if (dependencies !== null) {
        Load(dependencies);
        for (var i = 0, len = dependencies.length; i < len; i++) {
          var id = backslash(dependencies[i]);

          var context = this._bucket[id]();
          context.value = context.id;
          context.children = [];
          this._searched.push(context);
          this.add(context, parent.value);
        }
      }
      len = this._searched.length;
      if (len > 0) {
        var contexty = this._searched.shift();
        this.process(contexty);
      }
    };

    /**
     * clear method
     * it clears the tree by setting the root to null
     *
     *  @return void
     */
    Tree.prototype.clear = function(){
      this._root = null;
    };

    /**
     * toString method
     * it gives a much more descriptive information
     * when trying to output it as a string
     *
     * @return string
     */
    Tree.prototype.toString = function(){
      return "Tree::class";
    };

    return Tree;
  })();

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

  var Namespace = (function(){
    /**
     * Class Namespace
     *
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
     * @param object {EventManager}
     *
     * @return void
     */
    var Namespace = function(tree, eventManager){
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
    };

    /**
     * add method
     * adds the new context to the existing bucket
     *
     * @param array
     * @param function
     *
     * @return void
     */
    Namespace.prototype.add = function(id, context) {
      if (!Array.isArray(id)) {
        throw new Error("method Namespace::add expects first param to be of type array");
      }

      if (typeof context !== "function") {
        throw new Error("method Namespace::add expects second param to be of type function");
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
      };

      this._bucket[contextid] = function() {
        return {
          id: contextid,
          "class": context,
          dependencies: dependencies
        };
      };

      // triggers event add.namespaceid e.g. add.App\Welcome
      this._eventManager.trigger("add." + id[0], [context]);
    };

    /**
     * get method
     * gets an object of the context id with all depencdencies loaded
     * and instantiated, as parameters if defined.
     *
     * @param string {id of the context}
     *
     * @return object
     */
    Namespace.prototype.get = function(id) {
      /**
       * we backslash every forwardslash so as to match an id, because
       * every context id having a forwardslash has ben replaced with
       * a backslash before saving them in the bucket
       */
      id = backslash(id);

      // if the id hasnt been saved, we retyrn a null instead of undefined

      if (this._bucket[id] === undefined) {
        id = forwardslash(id);
        throw new Error("class " + id + " not defined, make sure that" +
          " the definition in the file is same as " + id + ".");
      }

      /**
       * if the context has some dependencies, we build up a tree so that
       * we can tranverse the nodes, instantiate and pass them as parameters
       * to the context that needs them.
       */
      if ((this._bucket[id]()).dependencies !== null) {
        // we set the root
        this._Tree.setRoot(this._bucket[id]);
        // we set the bucket where every nodes get fetched
        this._Tree.setBucket(this._bucket);
        // the children of each nodes gets added
        this._Tree.process();
        var nodes = [], contexts = [], arg = [];

        /**
         * we have to to traverse every nodes
         * so that they can be worked on
         */
        this._Tree.traverse(function(node){
          nodes.push(node.value);
          contexts.push(node.context);
        });

        for (var i = nodes.length - 1; i > -1; --i) {
          id = forwardslash(contexts[i].id);

          if (contexts[i].class.length === 0) {
            contexts[i].class = new contexts[i].class();
            // triggers event create.class
            this._eventManager.trigger("create." + id, [contexts[i].class]);
          } else {
            // we build the codes to be evaluated with the eval function
            var codes = "(function(){return new contexts[i].class(", endcode = ");})()";

            if (contexts[i].dependencies) {
              var len = contexts[i].dependencies.length;
              for (var j = 0; j < len; j++) {
                var hey = contexts[i].dependencies, contextid = backslash(hey[j]),
                  index = nodes.indexOf(contextid), funcLen = contexts[i].class.length;

                if (typeof contexts[index].class === "function") {
                  /**
                   * we really can't tell if this can happen but prevention
                   * is better than cure
                   */
                  contexts[index].class = this._handle(contexts[index], arg);
                }

                arg.push(contexts[index].class);
              }
            }

            for (var k = 0; k < funcLen; k++) {
              codes += "arg["+k+"],";
            }

            codes = codes.replace(/,$/, "") + endcode;

            contexts[i].class = eval(codes);

            // triggers event create.class
            this._eventManager.trigger("create." + id, [contexts[i].class]);

            for (k = 0; k < funcLen; k++) {
              arg.shift();
            }
          }
        }

        contexts = contexts[0].class;
        // we clean the tree up so that it doesn't conflict
        // with a context that may be needed later
        this._Tree.clear();

        return contexts;
      }

      var context = new (this._bucket[id]()).class();
      this._eventManager.trigger("create." + forwardslash(id), [context]);
      return context;
    };

    /**
     * _handle method
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
      codes = codes.replace(/,$/, "") + endcode;
      var context = eval(codes);
      // triggers event create.class
      this._eventManager.trigger("create."+id, [context]);

      return context;
    };

    /**
     * listen method
     * adds a listener to an event
     *
     * @param string
     * @param function
     * @return number
     */
    Namespace.prototype.listen = function(event, callback) {
      return this._eventManager.listen(event, callback);
    };

    /**
     * unListen method
     * removes a listener from an event
     *
     * @param number
     * @return number
     */
    Namespace.prototype.unListen = function(token) {
      return this._eventManager.unListen(token);
    };


    /**
     * toString method
     * we add a toString method so that it can give a much more descriptive information
     * when trying to output it as a string
     *
     * @return string
     */
    Namespace.prototype.toString = function(){
      return "Namespace::class";
    };

    return Namespace;
  })();

  var Cache = (function(window, undefined){
    /**
     * @var number
     * to hold the number of instantiated Cache object so that
     * the data each stores doesn't conflicts with other object of Cache
     */
    var instantiated = 0;
    /**
     * class Cache
     * Used to cache the contents of a file after it has been loaded
     * by the Load.js
     * After a file has been loaded for the first time it caches the files,
     * instead of the file to be fetched from the server it is
     * fetched from the browser to reduce load time of the app and it
     * can be reused by other parts of the app
     *
     * @private property _log
     * @private property _storage
     * @public property length
     *
     * @return void
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

  var backslash = function(string) {
      return string.replace(/\//g, "\\");
    }, forwardslash = function(string) {
      return string.replace(/\\/g, "/");
    };

  /**
   * function Load
   * loads the files passed to it from the server
   * Events:
   *  beforeload,
   *  afterload
   *
   * the beforeload event gets triggered before a file gets requested
   * from the server, in case you want to load a particula file before the file,
   * to listen to the event you call the listen method of the Bucket variable attaching a callback to the event
   *
   * Bucket.listen('load.beforeload.App/Welcome', function(){
   *  Bucket.Load('User.List');
   * });
   *
   * the afterload event gets triggered after a file has been loaded and evaluated,
   * to listen to this event also you call the listen method of Bucket
   *
   * Bucket.listen('load.afterload.App/Welcome', function(){
   *  var data = Users.get(id);
   * });
   *
   * @param array
   *
   * @return void
   */
  var Load =  (function() {
    var ajax = undefined, codes = "", HOST = location.protocol + "//" + location.host + "/",
      Event = new EventManager(), jsExt = /\.js$/i, requireConfig = {base: "app", cache: false},
      CacheManager = new Cache(),
      // variables by the automated cache system
      SECOND = 1000, MINUTE = SECOND * 60, HOUR = MINUTE * 60,
      DAY = HOUR * 24, WEEK = DAY * 7, MONTH = WEEK * 4;

    /**
     * here we try instantiating an Ajax object depending on the current
     * platform or browser being used.
     */
    try {
      ajax = new XMLHttpRequest();
    } catch(e) {
      try {
        ajax = new ActiveXObject("Msxml2.XMLHTTP.6.0");
      } catch(e) {
        try {
          ajax = new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch(e) {
          throw new Error("Ajax not supported in this browser.");
        }
      }
    }

    /**
     * Function process
     * Fetches the file been passed to it and attaches
     * its content to the {var codes} so that it can get evaluated
     * using the eval function
     *
     * @param string
     *
     * @return void
     */
    function process(file) {
      /**
       * if cache is enabled we try fetching from it instead of going to the server,
       * we will make a request to the server only if the cache has been busted
       */
      if (requireConfig.cache.automate) {
        if (CacheManager.retrieve(HOST + file) != null) {
          codes += "\n" + CacheManager.retrieve(HOST + file).value;

          return;
        }
      }

      var requestError = false,
        callback = function(event) {
          if (ajax.readyState === 4 && ajax.status === 200) {
            codes += "\n" + ajax.responseText+"";
            requestError = false;

            if (requireConfig.cache.automate) {
              CacheManager.store(url, ajax.responseText);
            }
          } else {
            requestError = true;
          }
        }, url = HOST + file;

      ajax.onreadystatechange = callback;

      ajax.open("GET", url, false);
      ajax.send(null);

      if (requestError) {
        throw new Error(url + ": " + ajax.statusText);
      }
    }

    /**
     * Function require
     * it fetches files from the server if not on the page already.
     * delegating the processing of the files to the process function
     *
     * @param string|array // array of files to include
     *
     * @return void
     */
    var require = function(files) {
      if (files === undefined) {
        throw new Error("require expects first param to be an array or string.");
      }
      if (!Array.isArray(files) && typeof files === "string") {
        files = [files];
      }
      var config = null;
      for (var id = 0, len = files.length; id < len; id++) {
        var file = files[id], filtered = false;
        // triggers event beforeload.file
        Event.trigger("beforeload."+file, []);

        /**
         * we check if filters is|are defined so that we can match them to the
         * right path specified by the filter
         */
        if (requireConfig.filters) {
          for (var filter in requireConfig.filters) {
            config = requireConfig.filters[filter];
            var regex = new RegExp("^" + filter, "i");
            filtered = false;

            if (regex.test(file)) {
              file = file.replace(regex, config);
              filtered = true;
              break;
            }
          }
        }

        if (!filtered) {
          file = requireConfig.base + "/" + file;
        }

        if (!jsExt.test(file)) {
          file = file + ".js";
        }
        process(file);
        // triggers event afterload.file
        Event.trigger("afterload."+files[id], []);
      }

      eval(codes);
      codes = "";
    };

    /**
     * static method setConfig
     * sets the configurations to be used by the Load function
     *
     * @param object
     *
     * @return void
     */
    require.setConfig = function(config) {
      for (var id in config) {
        requireConfig[id.toLowerCase()] = config[id];
      }

      require.update();
    };

    /**
     * static method listen
     * it attaches a listener to an event
     *
     * @param string
     * @param function
     *
     * @return number
     */
    require.listen = function(event, callback) {
      return Event.listen(event, callback);
    };

    /**
     * static method unListen
     * it detach a listener from an event
     *
     * @param number
     *
     * @return number
     */
    require.unListen = function(token) {
      return Event.unListen(token);
    };

    /**
     * burstCache method
     * it bursts the cache by clearing all the data related to the
     * Load function
     *
     * @return boolean
     */
    require.burstCache = function(){
      return CacheManager.clear();
    };

    /**
     * static method update
     * it updates the cache system to see if the cache has expired and
     * needs to be busted
     *
     * @return void
     */
    require.update = function(){
      var now = new Date(), expires = null, month = /^month/i,
        day = /^day/i, week = /^week/i, hour = /^hour/i, minute = /^minute/i,
        when = null, i = null;

      // we check if the cache system is to be automated
      if (requireConfig.cache.automate) {
        expires = requireConfig.cache.expires.split(" ");
        i = parseInt(expires[0]);
        when = expires[1];
        if (when.match(month)) {
          when = MONTH * i;
        } else if (when.match(week)) {
          when = WEEK * i;
        } else if (when.match(day)) {
          when = DAY * i;
        } else if (when.match(hour)) {
          when = HOUR * i;
        } else if (when.match(minute)) {
          when = MINUTE * i;
        } else {
          throw new Error("Invalid automated cache expire time given.");
        }

        if (CacheManager.retrieve("Cache") == null) {
          CacheManager.store("Cache", {updated: now.getTime(), expires: (now.getTime() + when)});
        }

        var time = CacheManager.retrieve("Cache").value;

        if (time.expires <= now.getTime()) {
          this.burstCache();
          CacheManager.store("Cache", {updated: now.getTime(), expires: (now.getTime() + when)});
        }
      }
    };

    /**
     * static method require
     * loads a file without adding a filter to it
     * @param array
     *
     * @return array
     */
    require.require = function(files){
      var length = files.length, i = 0, texts = [];

      for (; i < length; ++i) {
        process(files[i], true);
        texts.push(codes);
        codes = "";
      }

      return texts;
    };

    return require;
  })();

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
     * @param function // the function that gets excuted when the event occurs
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

  // we return the bucket var so that it can be accessed outside this closure
  return Bucket;
})(this);
