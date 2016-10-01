# BucketJS Library
* it tries to help you make your codes well organised i.e. a class per file
* ```var controller = Bucket('App/Core/Controller'); ``` matches app/core/controller.js file in the base directory.
 ```javascript
 Bucket(['App/Game'], function(){
    this.init = function(){
        console.log('game started');
    }
});
// matches webroot/app/game.js, you will find some examples below same as
// http://www.example.com/App/Game.js
```
* it tries to implement Namespacing in the other languages
* Include the src/Bucket.js file in your page and you are set to use it.
* The dist directory consists of the different aspects implemented into the library
<br>it is very simple to use
```javascript
/**
 * the files are fetched from a default folder App e.g. webroot/app, webroot/js/app
 * you can also set the base directory where the where the files should be fetched from
 * e.g. Bucket({base: 'js/app'});
 * it will fetch the files from webroot/js/app directory
 *
 * Bucket({
 *   /**
 *    * the default base is webroot/app if base is not set
 *    */
 *   base: 'mobile',
 *   filters: {
 *     /**
 *      * namespace id Bucket will be fetched from directory webroot/src/core
 *      */
 *     'Bucket': 'src/core',
 *     //namespace id App/Core will be fetched from webroot/framework
 *     'App/Core': 'framework'
 *   }
 * });
 */

// to define a class, the class name must match the namespace id given to it
// file: webroot/App/Core/Hello.js

Bucket(['App/Core/Hello'], function(){
  this.call = function(){
    alert('hello world');
  }
});

// file: www/index.html including the library
// to get the instantiated copy
var hello = Bucket('App/Core/Hello');
hello.call(); // 'hello world'

/**
 * defining a class with dependencies to other classes
 * a class can have as many dependencies as possible but they will all
 * be passed as parameters in the order they were declared to the class depending on them.
 * if a dependency depends on another class they all get passed for the library
 * is smart enough to sort that.
 */
// file: www/app/core/welcome.js

Bucket(['App/Core/Welcome', ['App/Core/Hello', 'App/Core/Bye']], function(hello, bye){
  // the hello param will be an object of App\Core\Hello::class
  this.welcome = function(){
    hello.call();
  }

  // the bye param will be an instance of App\Core\Bye::class
  this.bye = function(){
    bye.bye();
  }
});

// file; webroot/App/Core/Bye.js
Bucket(['App/Core/Bye'], function(){
  this.bye = function(){
    alert('Thank you for trying me out. Courtesy: BucketJS');
  }
});

// file: webroot/index.html including the library
// to get the instantiated copy
var app = Bucket('App/Core/Welcome');
app.welcome(); // => 'hello world'
app.bye() // => 'Thank you for trying me out. Courtesy: BucketJS'

/**
 * features prior to v0.1.1
 * added a new variable B as an alias to Bucket for conviniences reason
 * if not wanting to use Bucket.
 * trying out the namespace aliasing the above examples
 * assuming we changed the directory of some files but still want to use same
 * namespace id
 * e.g.
 */
B({
  /**
   * if not set, defaults to app folder under webroot
   * because every namespace which hasnt been filtered out will be
   * searched for in the base directory
   */
  base: 'project',
  /**
   * every contexts under App will be mapped
   * to webroot/mobile/src directory
   */
  filters: {
    'App': 'moblie/src'
  }
});

/**
 * changes prior to version 0.1.3:
 * Bucket.addProperty(context, properties);
 * added some events
 * namespace events
 * -- add.namespaceid
 * -- create.namespaceid
 * load events
 * -- beforeload.namespaceid
 * -- afterload.namespaceid
 * added event system to Bucket
 * -- Bucket.listen(event, callback);
 * -- Bucket.trigger(event, arguments);
 * -- Bucket.unListen(listener);
 */
/**
 * function Bucket.addProperty(context: function, propeties: object):context
 * function Bucket.listen(event: string, callback: function):string
 * function Bucket.trigger(event: string):void
 * function Bucket.unListen(token: string):void
 */
// require event examples
B.listen('require.beforeload.App/Core/Bye', function(){
  //
});
B.listen('require.afterload.App/Core/hello', function(){
  //
});

// namespace events examples
// the argument passed to the callback is the function defined under the namespace
B.listen('namespace.add.App/Core/Hello', function(context){
  /**
   * lets add some new properties to the prototype of context
   */
  B.addProperty(context, {
    user: 'BucketJS',
    end: function(){
      alert('call ended...');
    }
  });
});

var greet = B('App/Core/Hello');
greet.end(); // => 'call ended...'

// the argument passed to the callback is the instantiated copy of the function defined under the namespace
B.listen('namespace.create.App/Core/Bye', function(context){
  // the property can be accessed by the context depending on them
  Bye.user = 'BucketJS'
});

// changed require events to load instead of listening to an event of require.event it becomes load.event
var listener = B.listen('load.beforeload.App/Welcome', function(){
    // you might want to set somethings here
});

```
# Changes prior to version 1.0.0
* added a mini caching system to reduce load time and performance by caching loaded files,
<br>and fetching them from the cache on another visit to the site instead of requesting them from
<br>the server which can be an overkill.
<br>we store the cached files using the localStorage object attaching every cached item to property
<br>CacheLogger, so be careful not to delete the key CacheLogger from the localStorage object
* removed static method addProperty of Bucket
* attached a static method getCacheSystem which returns an instance of Cache
* added method burstAllCache to delete every property attached tho the property CacheLogger
* Added the cache configuration property to the configuration setting of the library
    * automate:boolean which sets if the Caching system should be automated
    * expires:string which has to be a valid date format, e.g. 1 month, 3 days, 4 hours e.t.c.
```javascript
/**
 * we setting our cache.expires to '1 month', we are informing the library that the cache
 * should be busted every month there are lots of options that
 * can be passed to it, e.g. 2 weeks, 12 months (equivalent to a year), 30 minutes,
 * e.t.c. what the property needs is just the number of month|week|day|hour|minutes
 */
Bucket({
    base: 'src',
    filters: {
        'BucketJS', 'vendor/BucketJS',
        'JQuery', 'jquery/plugins'
    },
    cache: {
        automate: true,
        expires: '1 month'
    }
});
```
* added method load to Bucket, it loads files passed to it using ajax
```javascript
/**
 * it can be an array of files to load or just a string and it returns an array
 * mapping it contents to the keys of files passed to it
 */
var contents = Bucket.load(['css/main.css', 'css/defaults.css', 'js/jquery.js']);
console.log(contents); // => [".head {color: red}...", ".serif {font-family: serif}...", "var JQuery = function..."]
```

If you think the project worths it, you can fork the library and you can contribute to it,
<br>and if you think there are some things we missing, please kindly contact me at atandarash@gmail.com or
<br>make a pull request listing the changes you want to be added or you can make them yourself and request a
<br>pull to merge your changes, thanks.
