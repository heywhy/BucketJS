BucketJS:
* it tries to help you make your codes well organised.
* not having to get disturbed if a function has been declared before.
* and try to keep the global scope to be as lean as possible.


Its very basic to use:
* Include the Bucket.min.js file in your page and you are set to use it.
* The lib directory consists of the different aspects that's built into BucketJS library

Example:

```javascript
/**
 * When defining a context you call the Bucket function
 * by passing an array as the first parameter in which the first index contains the
 * the context id e.g. Bucket(['Js']).
 * if the new context depends on other contexts which is defined already or yet to be defined, you pass
 * an array to the second index containing all its dependencies,
 * e.g. Bucket(['Js', ['Js/Caller', 'Js/Client']]), for they will be passed as arguments to the new
 * context definition and you can make use of the dependency|ies.
 *
 * The returned dependency|ies is|are object which have their dependency|ies loaded, already.
 *
 * The second argument of the function is the context definition which as to be of type function
 * rewriting the examples above, 
 * e.g.
 * Bucket(['Js', ['Js/Caller', 'Js/Client']], function(Caller, Client){
 *     this.call = function(){
 *         // assuming the Js/Caller::class a method for making calls
 *         Caller.call();
 *     }
 *     
 *     this.notify = function(){
 *         Client.post({url: '/home', data: 'name=you'});
 *     }
 * });
 *
 * If you need the defined context, you pass a string containing the contextid
 * e.g. var js = Bucket('js'); => object; 
 *
 * You don't have to get worried even if the dependency|ies hasn't been defined already, for every dependency|ies
 * gets binded when you are about to get the newly declared context.
 *
 * if you need to retrieve a defined context, just call
 * var caller = Bucket('Js/Caller'); => object;
 */
 
// a simple class without dependency|ies

Bucket(['Js/Caller'], function(){
    this.call = function(person) {
        alert("hello "+person);
    };
});

var caller = Bucket('Js/Caller');
caller.call('ayomide');
            
/**
 * with dependency
 * every dependency has to be within the bucket context
 * because the Js/Office::class needs the Js/Caller::class
 * to make a call
 */

Bucket(['Js/Office', ['Js/Caller']], function(Caller){
    // if you like you can attach it as a property
    this.Caller = Caller;
    
    this.call = function(staff){
        this.Caller.call(staff);
        this.respond(staff);
    }
    
    this.respond = function(staff){
        alert(staff+': Yes.');
    }
});

var office = Bucket('Js/Office');
office.call('secetary');

Bucket(['Js/Company/Bus'], function(){
    this.drive = function() {
        document.write('I\'m driving...');
    };
});
   
Bucket(['Js/Company/Store'], function(){
    this._store = [];
    
    this.keep = function(item){
        this._store.push(item);
    }
});
       
/**
 * includes dependencies, it can have as many depedencies
 * as possible as long as its defined within the BucketJS context
 */
            
Bucket(['Js/Company', ['Js/Office', 'Js/Company/Bus']],
function(Office, Bus){
    this.init = function(id){
        this.id = id;
    };
     
    /**
     * here we extend the Js/Office::class
     * you can access the parent methods through the this._super_ object
     * or this.__super__ function eg. this.__super__(methodName, ...args);
     */
     
    Bucket.extends(this, Office);
    
    this.call = function(staff, message){
        this.__super__('call', staff);
    };
    
    this.drive = function() {
        Bus.drive();
    }
});
            
var company = Bucket('Js/Company'),
Store = Bucket('Js/Company/Store');

company.call('Driver', 'We have an event today');     
company.drive();

/**
 * there is Instantiate function which takes the 
 * (namespaceid, [args], extend)
 * the extend parameter is optional
 * it immediately invokes the init method of the object
 * because the init method is assumed
 * to be the constructor
 */

company = Instantiate('Js/Company', ['Thejitters'], Store);

console.log(company.id); // => Thejitters

// calling keep method that got extended using Instantiate method instead
// instead of Bucket.extends(company, Store) and then coming to call the init method

company.keep('Thejitters');
```

if you think the project worths it, you can break
the library and you can contribute to it.

and if you think there are some things we missing, please kindly contact us
at **atandarash@gmail.com**