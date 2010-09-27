JS.Module = JS.makeClass();

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};
    
    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    
    this.include(methods);
  },
  
  define: function(name, callable) {
    var method = new JS.Method(this, name, callable);
    this.__fns__[name] = method;
    this.acceptMethod(method);
  },
  
  include: function(module) {
    if (!module) return;
    var field, value, mixins, i;
    
    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if (module.__dep__) module.__dep__.push(this);
      this.acceptModule(module);
    }
    else {
      if (typeof module.extend !== 'function') {
        mixins = [].concat(module.extend);
        i = mixins.length;
        while (i--) this.extend(mixins[i]);
      }
      if (typeof module.include !== 'function') {
        mixins = [].concat(module.include);
        i = mixins.length;
        while (i--) this.include(mixins[i]);
      }
      for (field in module) {
        if (!module.hasOwnProperty(field)) continue;
        value = module[field];
        if (this.shouldIgnore(field, value)) continue;
        this.define(field, value);
      }
    }
    return this;
  },
  
  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           typeof value !== 'function';
  },
  
  acceptMethod: function(method) {
    if (this.__tgt__) this.__tgt__[method.name] = method.callable;
    var i = this.__dep__.length;
    while (i--) this.__dep__[i].acceptMethod(method);
  },
  
  acceptModule: function(module) {
    for (var field in module.__fns__)
      this.acceptMethod(module.__fns__[field]);
  },
  
  instanceMethod: function(name) {
    return this.__fns__[name];
  }
});

