JS.Observable = (function() {
  
  var methods = {
    addObserver: function(observer, context) {
      this._observers = this._observers || [];
      this._observers.push({block: observer, context: context || null});
    },
    
    removeObserver: function(observer, context) {
      this._observers = this._observers || [];
      context = context || null;
      for (var i = 0, n = this.countObservers(); i < n; i++) {
        if (this._observers[i].block == observer && this._observers[i].context == context) {
          this._observers.splice(i,1);
          return;
        }
      }
    },
    
    removeObservers: function() {
      this._observers = [];
    },
    
    countObservers: function() {
      this._observers = this._observers || [];
      return this._observers.length;
    },
    
    notifyObservers: function() {
      if (!this.isChanged()) return;
      for (var i = 0, n = this.countObservers(), observer; i < n; i++) {
        observer = this._observers[i];
        observer.block.apply(observer.context, arguments);
      }
    },
    
    setChanged: function(state) {
      this._changed = !(state === false);
    },
    
    isChanged: function() {
      if (this._changed === undefined) this._changed = true;
      return !!this._changed;
    }
  };
  
  methods.subscribe   = methods.addObserver;
  methods.unsubscribe = methods.removeObserver;
  
  return JS.Module(methods);
})();
