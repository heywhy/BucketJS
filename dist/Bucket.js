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