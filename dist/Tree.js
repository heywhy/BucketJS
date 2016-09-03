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
   * function Tree
   * 
   * this helps in building a cute tree (Binary Tree kinda)
   * to help process dependencies loading in the right order
   *
   * @return void
   */
  window.Tree = function(){
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
    
})(window)