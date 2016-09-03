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
  var ajax = new XMLHttpRequest(), codes = '', baseUrl = 'App/',
  HOST = location.protocol + '//' + location.host, appRegex = /^app\//i;
  
  window.backslash = function(string) {
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
  window.require = function(files) {
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

})(this);