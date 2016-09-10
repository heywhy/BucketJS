B(['Bucket/Storage'], function(){
    /**
     * private property Storage
     * @var localStorage|object
     */
    var Storage = localStorage || {};

    /**
     * Keep method
     * it stores a value in its memory mapping it to the key
     * provided
     * 
     * @param string|number
     * @param string
     * @return void
     */
    this.keep = function(key, value){
        if (Storage.setItem !== undefined) {
            Storage.setItem(key, value);
        }

        Storage[key] = value;
    }

    /**
     * Retrieve method
     * it retrieve's the value mapped to the key from the
     * store
     * 
     * @param string|number
     * @return string|null
     */
    this.retrieve = function(key){
        var value = null;
        
        if (key === undefined) {
            return Storage;
        }

        if (Storage.getItem !== undefined) {
            value = Storage.getItem(key);
        }

        return value = value || Storage[key];
    }

    /**
     * Delete method
     * it delete's the value mapped to the key provided
     * 
     * @param string|number
     * @return void 
     */
    this.remove = function(key){
        if (Storage.removeItem !== undefined) {
            Storage.removeItem(key);
        }

        delete Storage[key];
    }
});