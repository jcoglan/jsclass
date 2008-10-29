JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), {
  initialize: function(parent, methods) {
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = this.klass;
    if (!JS.isFn(parent)) {
      methods = parent;
      parent = Object;
    }
    klass.inherit(parent);
    klass.include(methods, null, false);
    klass.resolve();
    do {
      parent.inherited && parent.inherited(klass);
    } while (parent = parent.superclass);
    return klass;
  },
  
  inherit: function(klass) {
    this.superclass = klass;
    
    if (this.__eigen__) {
      this.__eigen__().include(klass.__eigen__
          ? klass.__eigen__()
          : new JS.Module(klass.prototype));
      this.__meta__.resolve();
    }
    
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    
    this.__mod__ = new JS.Module({}, {_resolve: this.prototype});
    this.include(JS.Kernel, null, false);
    
    if (klass !== Object) this.include(klass.__mod__ || new JS.Module(klass.prototype,
        {_resolve: klass.prototype}), null, false);
  },
  
  include: function(module, options, resolve) {
    if (!module) return;
    var mod = this.__mod__, options = options || {};
    options._included = this;
    return mod.include(module, options, resolve !== false);
  },
  
  extend: function(module) {
    if (!this.callSuper) return;
    this.callSuper();
    var i = this.subclasses.length;
    while (i--) this.subclasses[i].extend();
  },
  
  define: function() {
    var module = this.__mod__;
    module.define.apply(module, arguments);
    module.resolve();
  },
  
  includes:   JS.delegate('__mod__', 'includes'),
  ancestors:  JS.delegate('__mod__', 'ancestors'),
  resolve:    JS.delegate('__mod__', 'resolve')
});

