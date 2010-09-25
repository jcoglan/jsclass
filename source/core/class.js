JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, methods) {
    if (typeof name !== 'string') {
      methods = arguments[0];
      name    = undefined;
    }
    var klass = JS.makeClass();
    this.__mod__ = new JS.Module(methods, {_target: klass.prototype});
    
    return JS.extend(klass, this);
  }
});

