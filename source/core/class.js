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
    
    klass.prototype.constructor =
    klass.prototype.klass = klass;
    
    klass.__eigen__(false).include(parent.__meta__);
    
    klass.__tgt__ = klass.prototype;
    
    var parentModule = (parent === Object)
                     ? {}
                     : (parent.__fns__ ? parent : new JS.Module(parent.prototype, {_resolve: false}));
    
    klass.include(JS.Kernel, {_resolve: false})
         .include(parentModule, {_resolve: false})
         .include(methods, {_resolve: false})
         .resolve();
    
    if (typeof parent.inherited === 'function')
      parent.inherited(klass);
    
    return klass;
  }
});

