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
