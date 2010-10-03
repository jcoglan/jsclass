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
    
    this.setName(name);
    this.include(methods);
  },
  
  setName: function(name) {
    this.__nom__ = this.displayName = name || '';
    
    for (var field in this.__fns__)
      this.__name__(field);
    
    if (name && this.__meta__)
      this.__meta__.setName(name + '.');
  },
  
  __name__: function(name) {
    if (!this.__nom__) return;
    
    var object = this.__fns__[name];
    if (!object) return;
    
    name = this.__nom__.replace(JS.END_WITHOUT_DOT, '$1#') + name;
    if (JS.isFn(object.setName)) return object.setName(name);
    if (JS.isFn(object)) object.displayName = name;
  },
  
  define: function(name, callable) {
    var method = JS.Method.create(this, name, callable);
    this.__fns__[name] = method;
    this.__name__(name);
    this.acceptMethod(name, method);
  },
  
  include: function(module, options) {
    if (!module) return;
    
    var options = options || {},
        extended, field, value, mixins, i;
    
    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if (module.__dep__) module.__dep__.push(this);
      this.acceptModule(module);
      
      if (extended = options._extended) {
        if (typeof module.extended === 'function')
          module.extended(extended);
      }
      else {
        if (typeof module.included === 'function')
          module.included(this);
      }
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
  
  acceptMethod: function(name, method) {
    if (this.__fns__.hasOwnProperty(name) &&
        this.__fns__[name] !== method)
      return;
    
    if (this.__tgt__) this.__tgt__[name] = JS.Method.compile(method, this);
    
    var i = this.__dep__.length;
    while (i--)
      this.__dep__[i].acceptMethod(name, method);
  },
  
  acceptModule: function(module) {
    var fns = module.__fns__,
        inc = module.__inc__,
        field, i, n;
    
    for (i = 0, n = inc.length; i < n; i++)
      this.acceptModule(inc[i]);
    
    for (field in fns)
      this.acceptMethod(field, fns[field]);
  },
  
  ancestors: function(list) {
    list = list || [];
    
    for (var i = 0, n = this.__inc__.length; i < n; i++)
      this.__inc__[i].ancestors(list);
    
    if (JS.indexOf(list, this) < 0)
      list.push(this);
    
    return list;
  },
  
  instanceMethod: function(name) {
    return this.__fns__[name];
  },
  
  instanceMethods: function(recursive) {
    var methods = [],
        fns     = this.__fns__,
        field;
    
    for (field in fns) methods.push(field);
    return methods;
  },
  
  lookup: function(name) {
    var ancestors = this.ancestors(),
        methods   = [],
        fns;
    
    for (var i = 0, n = ancestors.length; i < n; i++) {
      fns = ancestors[i].__fns__;
      if (fns.hasOwnProperty(name) && (fns[name] instanceof JS.Method))
        methods.push(fns[name]);
    }
    return methods;
  },
  
  toString: function() {
    return this.displayName;
  }
});

