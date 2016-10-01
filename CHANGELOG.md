version 1.0.0:
<br>I call this the biggest release of BucketJS Library with some cute improvement to it.
* removed static method addProperty of Bucket
* A Caching model was added to the library to help improve performance of the library by reducing the time needed
to load the necessary files needed
* attached a static method getCacheSystem which returns an instance of Cache
* added method burstAllCache to delete every property attached tho the property CacheLogger
* added a static method load to bucket, it loads contents of files and returns an array
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
        'JQuery', 'lib'
    },
    cache: {
        automate: true,
        expires: '1 month'
    }
});
```

version 0.1.3:
* added some events
    * namespace
        * add.namespaceid
        * create.namespaceid
    * require
        * beforeload.namespaceid
        * afterload.namespaceid
    * added event system to Bucket
        * Bucket.listen(event, callback);
        * Bucket.trigger(event, arguments);
        * Bucket.unListen(listener);


version 0.1.1:
* removed property fetch of the configuration object
* added filters property to configuration options
    * the aim is to allow path alias to a namespaces e.g.
```javascript
Bucket({
    /**
     * if not set, defaults to app folder under webroot
     * because every namespace which hasnt been filtered out will be
     * searched for in the directory
     */
    base: 'mobile',
    filters: {
        /**
         * namespace id Bucket will be fetched from directory www/mobile/src/core
         */
        'Bucket': 'src/core'
    }
});
```
* added variable B as alias to Bucket for conviniences
* well descriptive comments updated.
