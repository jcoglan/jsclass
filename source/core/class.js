JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods) {
    if (typeof name !== 'string') {
      methods = arguments[1];
      parent  = arguments[0];
      name    = undefined;
    }
    if (typeof parent !== 'function') {
      methods = parent;
      parent  = Object;
    }
    var klass = JS.makeClass(parent);
    this.__mod__ = new JS.Module(methods, {_target: klass.prototype});
    
    return JS.extend(klass, this);
  }
});

