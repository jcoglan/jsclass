var Globals = {
    originals: [],
    userDefined: [],
    warned: [],
    
    initialize: function() {
        if (this.originals.length > 0) return;
        for (var key in window) this.originals.push(key);
    },
    
    register: function() {
        for (var i = 0, n = arguments.length; i < n; i++)
            this.userDefined.push(arguments[i]);
    },
    
    check: function() {
        for (var key in window) {
            if (this.originals.indexOf(key) == -1
                    && this.userDefined.indexOf(key) == -1
                    && this.warned.indexOf(key) == -1) {
                console.warn('Global variable: ' + key);
                this.warned.push(key);
            }
        }
    },
    
    run: function() {
        var self = this;
        setInterval(function() { self.check() }, 1000);
    }
};

Globals.register('JS', 'it', 'its', 'require', 'undefined');
Globals.initialize();

