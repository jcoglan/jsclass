JS.Module = JS.makeClass();
JS.Module.__queue__ = [];

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};
    
    this.__inc__ = new JS.List();
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    
    this.setName(name);
    this.include(methods);
    
    if (JS.Module.__queue__)
      JS.Module.__queue__.push(this);
  },
  
  setName: function(name) {
    this.displayName = name || '';
    
    for (var field in this.__fns__)
      this.__name__(field);
    
    if (name && this.__meta__)
      this.__meta__.setName(name + '.');
  },
  
  __name__: function(name) {
    if (!this.displayName) return;
    
    var object = this.__fns__[name];
    if (!object) return;
    
    name = this.displayName.replace(JS.END_WITHOUT_DOT, '$1#') + name;
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
    if (!module) return this;
    
    var options = options || {},
        extend  = module.extend,
        include = module.include,
        inclusion, extended, field, value, mixins, i, n;
    
    if (module.__fns__ && module.__inc__) {
      inclusion = new JS.Inclusion(this, module);
      this.__inc__.push(inclusion);
      if ((module.__dep__ || {}).push) module.__dep__.push(inclusion);
      this.acceptModule(module, inclusion);
      
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
      if (this.shouldIgnore('extend', extend)) {
        mixins = [].concat(extend);
        for (i = 0, n = mixins.length; i < n; i++)
          this.extend(mixins[i]);
      }
      if (this.shouldIgnore('include', include)) {
        mixins = [].concat(include);
        for (i = 0, n = mixins.length; i < n; i++)
          this.include(mixins[i]);
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
           (typeof value !== 'function' ||
             (value.__fns__ && value.__inc__));
  },
  
  acceptMethod: function(name, method, inclusion) {
    if (this.__fns__.hasOwnProperty(name) &&
        this.__fns__[name] !== method)
      return;
    
    var compiled = JS.Method.compile(method, this);
    if (this.__tgt__ && this.__tgt__[name] !== compiled)
      this.__tgt__[name] = compiled;
    
    if (inclusion) inclusion.acceptMethod(name, method);
    
    var i = this.__dep__.length;
    while (i--)
      this.__dep__[i].acceptMethod(name, method);
  },
  
  acceptModule: function(module, inclusion) {
    var fns  = module.__fns__,
        inc  = module.__inc__,
        node = inc.head,
        field, i, n;
    
    while (node) {
      this.acceptModule(node.mixin, inclusion);
      node = node.next;
    }
    
    for (field in fns)
      this.acceptMethod(field, fns[field], inclusion);
  },
  
  ancestors: function(list) {
    var list = list || [],
        inc  = this.__inc__,
        node = inc.head;
    
    while (node) {
      node.mixin.ancestors(list);
      node = node.next;
    }
    
    if (JS.indexOf(list, this) < 0)
      list.push(this);
    
    return list;
  },
  
  lookup: function(name) {
    var ancestors = this.ancestors(),
        methods   = [],
        fns;
    
    for (var i = 0, n = ancestors.length; i < n; i++) {
      fns = ancestors[i].__fns__;
      if (fns.hasOwnProperty(name) && fns[name] instanceof JS.Method)
        methods.push(fns[name]);
    }
    return methods;
  },
  
  includes: function(module) {
    if (module === this) return true;
    
    var inc  = this.__inc__,
        node = inc.head;
    
    while (node) {
      if (node.mixin.includes(module))
        return true;
      node = node.next;
    }
    return false;
  },
  
  instanceMethod: function(name) {
    return this.lookup(name).pop();
  },
  
  instanceMethods: function(recursive, list) {
    var methods = list || [],
        fns     = this.__fns__,
        field;
    
    for (field in fns) {
      if (JS.indexOf(methods, field) < 0)
        methods.push(field);
    }
    
    if (recursive !== false) {
      var ancestors = this.ancestors(), i = ancestors.length;
      while (i--) ancestors[i].instanceMethods(false, methods);
    }
    return methods;
  },
  
  match: function(object) {
    return object && object.isA && object.isA(this);
  },
  
  toString: function() {
    return this.displayName;
  }
});

