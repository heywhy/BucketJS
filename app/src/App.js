B(['App', ['Bucket/Cache']], function(Cache){
    var doc = document, collector = document.querySelector('#collector'),
    saveBtn = doc.querySelector('#save-btn'), resetBtn = doc.querySelector('#reset-btn'),
    self = this, appView = doc.querySelector('#appView'), save = function(event){
        self.save();
    }, reset = function(event){
        self.reset();
    };
    
    /**
     * Init method
     * 
     * @return void
     */
    this.init = function(){
        if (Cache.get('todoCounter') == null) {
            Cache.store('todoCounter', 0);
        }

        this.deleted = [];
        this.counter = parseInt(Cache.get('todoCounter'));
        this.updateView();
        resetBtn.addEventListener('click', reset, false);
        saveBtn.addEventListener('click', save, false);
    }

    /**
     * Save method
     * it saves a new todo task
     * 
     * @return void
     */
    this.save = function(event){
        var content = collector.innerHTML, self = this,
        todo = {
            id: self.counter,
            content: content,
            date: Date.now()
        };
        
        if (content.length > 0) {
            collector.innerHTML = '';
            if (this.deleted.length > 0) {
                Cache.store(this.deleted.shift(), JSON.stringify(todo));
            } else {
                ++this.counter;
                Cache.store(this.counter, JSON.stringify(todo));
                Cache.store('todoCounter', this.counter);
            }

            this.updateView();
        }
    }

    /**
     * UpdateView method
     * it updates th list of tasks immediately when an action
     * takes plac
     * 
     * @return void
     */
    this.updateView = function(){
        var doc = document, store = Cache.getAll(), layout = null,
        ul = '<ul>', lists = '';

        for (var i in store) {
            if (i !== 'todoCounter') {
                i = parseInt(i);
                var content = JSON.parse(Cache.get(i)), text = content.content.trim();
                lists += "<li>" + text + " <span class='date'>"
                    + "</span><span class='inline-block'><button onclick='app.delete("
                    + i + ");' class='delete-btn'>completed</button></span></li>";
            }
        }
        appView.innerHTML = ul+lists+'</ul>';
    }

    /**
     * Reset method
     * it resets the app to the initial state
     * @return void
     */
    this.reset = function(){
        var store = Cache.getAll();
        this.counter = 0;
        for (var i in store) {
            Cache.delete(i);
        }
        this.updateView();
    }

    /**
     * Delete method
     * 
     * @param number
     * @return void
     */
    this.delete = function(id){
        Cache.delete(id);
        this.deleted.push(id);
        this.updateView();
    }
});