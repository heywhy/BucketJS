B(['Bucket/Cache', ['Bucket/Storage']], function(Storage){
    /**
     * GetAll method
     * 
     * @return object
     */
    this.getAll = function(){
        return Storage.retrieve();
    }

    /**
     * Store method
     * its stores a value mapping to a key
     * 
     * @param string|number
     * @param string
     * @return void
     */
    this.store = function(key, value) {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        Storage.keep(key, value);
    }

    /**
     * Get method
     * its get the value mapped to the given key
     * 
     * @param string|number
     * @return string
     */
    this.get = function(key) {
        return Storage.retrieve(key);
    }

    /**
     * Delete method
     * its deletes the value mapped to the key
     * 
     * @param string|number
     * @return void
     */
    this.delete = function(key){
        Storage.remove(key);
    }
});