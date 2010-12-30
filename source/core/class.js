JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[2];
      methods = arguments[1];
      parent  = arguments[0];
      name    = undefined;
    }
    if (typeof parent !== 'function') {
      options = methods;
      methods = parent;
      parent  = Object;
    }
    JS.Module.prototype.initialize.call(this, name);
    
    options = options || {};
    
    var klass = JS.makeClass(parent);
    JS.extend(klass, this);
    
    klass.prototype.constructor =
    klass.prototype.klass = klass;
    
    klass.__eigen__().include(parent.__meta__, {_resolve: options._resolve});
    
    klass.__tgt__ = klass.prototype;
    
    var parentModule = (parent === Object)
                     ? {}
                     : (parent.__fns__ ? parent : new JS.Module(parent.prototype, {_resolve: false}));
    
    klass.include(JS.Kernel,    {_resolve: false})
         .include(parentModule, {_resolve: false})
         .include(methods,      {_resolve: false});
    
    if (options._resolve !== false) klass.resolve();
    
    if (typeof parent.inherited === 'function')
      parent.inherited(klass);
    
    return klass;
  }
});

