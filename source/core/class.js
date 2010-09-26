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
    JS.Module.prototype.initialize.call(this, name);
    
    var klass = JS.makeClass(parent);
    JS.extend(klass, this);
    
    JS.Kernel.instanceMethod('__eigen__').call(klass);
    klass.__meta__.include(parent.__meta__);
    
    klass.__tgt__ = klass.prototype;
    
    klass.include(JS.Kernel)
         .include(parent)
         .include(methods);
    
    return klass;
  }
});

