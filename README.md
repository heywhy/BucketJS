# BucketJS Library
* it tries to help you make your codes well organised i.e. a class per file
 * var control = Bucket('App/Core/Controller') matches app/core/controller.js file in the base directory.
 * Bucket(['App/Game'], function(){
    this.init = function(){
      console.log('game started');
    }
  }); matches www/app/game.js
 * you will find some examples below
* trying to implement Namespacing in the other languages
* Include the src/Bucket.js file in your page and you are set to use it.
* The dist directory consists of the different aspects implemented into the library

it is very simple to use
```javascript
/**
 * the files are fetched from a default folder App e.g. www/app, www/js/app
 * you can also set the base directory where the app folder is
 * e.g. version 0.1.0: Bucket({fetch: true, base: js/app/});
 * it will fetch the files from www/js/app directory
 *
 * version 0.1.1: Bucket({
 *   /**
 *    * the default base is www/app if base is not set
 *    */
 *   base: 'mobile',
 *   filters: {
 *     /**
 *      * namespace id Bucket will be fetched from directory www/mobile/src/core
 *      */
 *     'Bucket': 'src/core',
 *     /**
 *      * namespace id App/Core will be fetched from www/framework
 *     'App/Core': 'framework'
 *   }
 * });
 */
 
// to define a class, the classname must match the path to the file
// file: www/app/core/hello.js
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
  
  this.bye = function(){
    bye.bye();
  }
});

// file; www/app/core/bye.js
Bucket(['App/Core/Bye'], function(){
  this.bye = function(){
    alert('Thank you for trying me out. Courtesy: BucketJS');
  }
});

// file: www/index.html including the library
// to get the instantiated copy
var app = Bucket('App/Core/Welcome');
app.welcome(); // => 'hello world'
app.bye() // => 'Thank you for trying me out. Courtesy: BucketJS'

/**
 * features prior to v0.1.1
 * adde a new variable B as an alias to Bucket for conviniences reason
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
   * searched for in the directory
   */
  base: 'project',
  /**
   * every contexts under App will be mapped
   * to www/mobile/src directory
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
 * require events
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

```

Some features has been added prior to version 0.1.1, you can check the
changelog file in the base directory.

If you think the project worths it, you can break
the library and you can contribute to it.

and if you think there are some things we missing, please kindly contact us
at atandarash@gmail.com