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
  var ajax = undefined, codes = '',
  HOST = location.protocol + '//' + location.host;
  window.backslash = function(string) {
    return string.replace(/\//g, '\\');
  };
  window.forwardslash = function(string) {
    return string.replace(/\\/g, '/');
  };
  
  try {
    ajax = new XMLHttpRequest();
  } catch(e) {
    try {
      ajax = new ActiveXObject('Msxml2.XMLHTTP.6.0');
    } catch(e) {
      try {
        ajax = new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch(e) {
        throw new Error('XMLHttpRequest not supported')
      }
    }
  }
  
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
  window.require = function(files) {
    if (files === undefined || !Array.isArray(files)) {
      throw new TypeError('require expects first param to be an array.')
    }
    
    if (require.cache === undefined) {
      require.cache = {};
    }
    
    var config = require.config;
    
    for (var id = 0, len = files.length; id < len; id++) {
      var file = files[id];
      
      // triggers event beforeload.file
      require.event.trigger('beforeload.'+file);
      
      /**
       * we check if filters is|are defined so that we can match them to the
       * right path specified by the filter
       */
      if (require.config.filters !== undefined) {
        var aliased = false;
        for (var filter in config.filters) {
          var regex = new RegExp("^("+filter+")", "i"),
          src = config.filters[filter].replace(/^\//, '').replace(/\/$/, '');
          
          if (regex.test(file)) {
            file = file.replace(regex, '/'+src);
            aliased = true;
            break;
          }
        }

        if (!aliased) {
            file = '/'+require.config.base+'/'+file;
        }
      }
      
      if (file.match(/(\.js)$/i) === null) {
        file += '.js'
      }
      
      process(file);
      // triggers event afterload.file
      require.event.trigger('afterload.'+files[id]);
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
   * static method require.setConfig
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
   * static property event
   * @var object {EventManager}
   */
  require.event = new EventManager();

})(this);