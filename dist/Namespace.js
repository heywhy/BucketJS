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
/*eslint no-undef: off*/
// @var function
var Namespace = (function () {
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
   */
  var Namespace = function (tree, eventManager) {
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
   * adds the new context to the existing bucket, so that it can
   * be fetched when needed.
   *
   * @param array
   * @param function
   *
   * @return void
   */
  Namespace.prototype.add = function (id, context, prototype) {
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

    if (prototype && typeof prototype === "object") {
      context.prototype = prototype;
      context.prototype.constructor = context;
    }

    /**
     * we add a toString method to every context saved,
     * so that it can give a much more descriptive information
     * when trying to output it as a string
     */
    context.prototype.toString = function () {
      return contextid + "::class";
    };

    this._bucket[contextid] = function () {
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
   * gets an object of the context id with all dependencies loaded
   * and instantiated, as parameters if defined.
   *
   * @param string // id mapped to the context
   *
   * @return object
   */
  Namespace.prototype.get = function (id) {
    /**
     * we backslash every forwardslash so as to match an id, because
     * every context id having a forwardslash has ben replaced with
     * a backslash before saving them in the bucket
     */
    id = backslash(id);

    // if the id hasnt been saved, we return an object of Error of undefined
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
      // the tree gets built by adding every  child to its parent
      this._Tree.process();
      var nodes = [], contexts = [], arg = [];

      /**
       * we have to to traverse every nodes
       * so that they can be worked on
       */
      this._Tree.traverse(function (node) {
        nodes.push(node.value);
        contexts.push(node.context);
      });

      // we start working with the nodes from the bottom
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

          if (arg.length > 0) {
            for (var k = 0; k < funcLen; k++) {
              codes += "arg[" + k + "],";
            }
          }

          if (typeof contexts[i].class === "function") {
            codes = codes.replace(/,$/, "") + endcode;
            contexts[i].class = eval(codes);
          }

          // triggers event create.class
          this._eventManager.trigger("create." + id, [contexts[i].class]);

          // clean up the arguments array
          for (k = 0; k < funcLen; k++) {
            arg.shift();
          }
        }
      }

      contexts = contexts[0].class;
      /**
       * we clean the tree up so that it doesn't conflict
       * with a context that may be required later in the application and
       * we can build up a new tree for the context
       */
      this._Tree.clear();

      return contexts;
    }

    // if the context doesn't have a dependency, no tree gets built, we
    // only instantiate the context and return it.
    var context = new (this._bucket[id]()).class();
    this._eventManager.trigger("create." + forwardslash(id), [context]);

    return context;
  };

  /**
   * _handle method
   * it is used to handle a a dependency which is of
   * type function which we really can predict if it is possible
   *
   * @param function
   * @param array // where the remaining contexts will be fetched from
   *
   * @return object
   */
  Namespace.prototype._handle = function (klass, arg) {
    var dependencies = klass.dependencies,
      len = dependencies ? dependencies.length : null,
      args = len ? arg.splice(0, len) : null, codes = "(function(){return new klass.class(",
      endcode = ");})()", id = forwardslash(klass.id);

    if (dependencies && len > 0) {
      for (var i = 0; i < len; i++) {
        codes += "args[" + i + "],";
      }
    }
    codes = codes.replace(/,$/, "") + endcode;
    var context = eval(codes);
    // triggers event create.class
    this._eventManager.trigger("create." + id, [context]);

    return context;
  };

  /**
   * listen method
   * adds a listener to an event
   *
   * @param string
   * @param function
   *
   * @return number
   */
  Namespace.prototype.listen = function (event, callback) {
    return this._eventManager.listen(event, callback);
  };

  /**
   * unListen method
   * removes a listener from an event
   *
   * @param number
   * @return number
   */
  Namespace.prototype.unListen = function (token) {
    return this._eventManager.unListen(token);
  };

  /**
   * toString method
   * we add a toString method so that it can give a much more descriptive information
   * when trying to output it as a string
   *
   * @return string
   */
  Namespace.prototype.toString = function () {
    return "Namespace::class";
  };

  return Namespace;
})();
