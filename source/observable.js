JS.Observable = new JS.Module({
  addObserver: function(observer, context) {
    (this.__observers__ = this.__observers__ || []).push({bk: observer, cx: context || null});
  },
  
  removeObserver: function(observer, context) {
    this.__observers__ = this.__observers__ || [];
    context = context || null;
    for (var i = 0, n = this.countObservers(); i < n; i++) {
      if (this.__observers__[i].bk == observer && this.__observers__[i].cx == context) {
        this.__observers__.splice(i,1);
        return;
      }
    }
  },
  
  removeObservers: function() {
    this.__observers__ = [];
  },
  
  countObservers: function() {
    return (this.__observers__ = this.__observers__ || []).length;
  },
  
  notifyObservers: function() {
    if (!this.isChanged()) return;
    for (var i = 0, n = this.countObservers(), observer; i < n; i++) {
      observer = this.__observers__[i];
      observer.bk.apply(observer.cx, arguments);
    }
  },
  
  setChanged: function(state) {
    this.__changed__ = !(state === false);
  },
  
  isChanged: function() {
    if (this.__changed__ === undefined) this.__changed__ = true;
    return !!this.__changed__;
  }
});

JS.Observable.include({
  subscribe:    JS.Observable.instanceMethod('addObserver'),
  unsubscribe:  JS.Observable.instanceMethod('removeObserver')
});
