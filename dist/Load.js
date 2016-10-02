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
