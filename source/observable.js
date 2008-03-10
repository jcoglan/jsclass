JS.Observable = (function(observers, changed) {
  
  var methods = {
    addObserver: function(observer, context) {
      this[observers] = this[observers] || [];
      this[observers].push({bk: observer, cx: context || null});
    },
    
    removeObserver: function(observer, context) {
      this[observers] = this[observers] || [];
      context = context || null;
      for (var i = 0, n = this.countObservers(); i < n; i++) {
        if (this[observers][i].bk == observer && this[observers][i].cx == context) {
          this[observers].splice(i,1);
          return;
        }
      }
    },
    
    removeObservers: function() {
      this[observers] = [];
    },
    
    countObservers: function() {
      this[observers] = this[observers] || [];
      return this[observers].length;
    },
    
    notifyObservers: function() {
      if (!this.isChanged()) return;
      for (var i = 0, n = this.countObservers(), observer; i < n; i++) {
        observer = this[observers][i];
        observer.bk.apply(observer.cx, arguments);
      }
    },
    
    setChanged: function(state) {
      this[changed] = !(state === false);
    },
    
    isChanged: function() {
      if (this[changed] === undefined) this[changed] = true;
      return !!this[changed];
    }
  };
  
  methods.subscribe   = methods.addObserver;
  methods.unsubscribe = methods.removeObserver;
  
  return JS.Module(methods);
})('_observers', '_changed');
