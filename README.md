# BucketJS Library
* it tries to help you make your codes well organised i.e. a class per file
...* var control = Bucket('App/Core/Controller') matches app/core/controller.js file in the base directory.
...* Bucket(['App/Game'], function(){
    this.init = function(){
      console.log('game started');
    }
  }); matches www/app/game.js
...* you will find some examples below
* trying to implement Namespacing in the other languages
* Include the src/Bucket.js file in your page and you are set to use it.
* The dist directory consists of the different aspects implemented into the library

it is very simple to use
```javascript
/**
 * the files are fetched from a default folder App e.g. www/app, www/js/app
 * you can also set the base directory where the app folder is
 * e.g. Bucket({fetch: true, base: js/app/});
 * it will fetch the files from www/js/app directory
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
```

If you think the project worths it, you can break
the library and you can contribute to it.

and if you think there are some things we missing, please kindly contact us
at atandarash@gmail.com