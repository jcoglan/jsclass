JS.Observable = {
  addObserver: function(observer, context) {
    (this._observers = this._observers || []).push({bk: observer, cx: context || null});
  },
  
  removeObserver: function(observer, context) {
    this._observers = this._observers || [];
    context = context || null;
    for (var i = 0, n = this.countObservers(); i < n; i++) {
      if (this._observers[i].bk == observer && this._observers[i].cx == context) {
        this._observers.splice(i,1);
        return;
      }
    }
  },
  
  removeObservers: function() {
    this._observers = [];
  },
  
  countObservers: function() {
    return (this._observers = this._observers || []).length;
  },
  
  notifyObservers: function() {
    if (!this.isChanged()) return;
    for (var i = 0, n = this.countObservers(), observer; i < n; i++) {
      observer = this._observers[i];
      observer.bk.apply(observer.cx, arguments);
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

JS.Observable.subscribe   = JS.Observable.addObserver;
JS.Observable.unsubscribe = JS.Observable.removeObserver;
JS.Observable = JS.Module(JS.Observable);
