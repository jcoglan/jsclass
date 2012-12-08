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

    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    this.__anc__ = null;
    this.__mct__ = {};

    this.setName(name);
    this.include(methods, {_resolve: false});

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
    if (typeof object.setName === 'function') return object.setName(name);
    if (typeof object === 'function') object.displayName = name;
  },

  define: function(name, callable, options) {
    var method  = JS.Method.create(this, name, callable),
        resolve = (options || {})._resolve;

    this.__fns__[name] = method;
    this.__name__(name);
    if (resolve !== false) this.resolve();
  },

  include: function(module, options) {
    if (!module) return this;

    var options = options || {},
        resolve = options._resolve !== false,
        extend  = module.extend,
        include = module.include,
        extended, field, value, mixins, i, n;

    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if ((module.__dep__ || {}).push) module.__dep__.push(this);

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
          this.include(mixins[i], {_resolve: false});
      }
      for (field in module) {
        if (!module.hasOwnProperty(field)) continue;
        value = module[field];
        if (this.shouldIgnore(field, value)) continue;
        this.define(field, value, {_resolve: false});
      }
      if (module.hasOwnProperty('toString'))
        this.define('toString', module.toString, {_resolve: false});
    }

    if (resolve) this.resolve();
    return this;
  },

  alias: function(aliases) {
    for (var method in aliases) {
      if (!aliases.hasOwnProperty(method)) continue;
      this.define(method, this.instanceMethod(aliases[method]), {_resolve: false});
    }
    this.resolve();
  },

  resolve: function(host) {
    var host   = host || this,
        target = host.__tgt__,
        inc    = this.__inc__,
        fns    = this.__fns__,
        i, n, key, compiled;

    if (host === this) {
      this.__anc__ = null;
      this.__mct__ = {};
      i = this.__dep__.length;
      while (i--) this.__dep__[i].resolve();
    }

    if (!target) return;

    for (i = 0, n = inc.length; i < n; i++)
      inc[i].resolve(host);

    for (key in fns) {
      compiled = JS.Method.compile(fns[key], host);
      if (target[key] !== compiled) target[key] = compiled;
    }
    if (fns.hasOwnProperty('toString'))
      target.toString = JS.Method.compile(fns.toString, host);
  },

  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           (typeof value !== 'function' ||
             (value.__fns__ && value.__inc__));
  },

  ancestors: function(list) {
    var cachable = !list,
        list     = list || [],
        inc      = this.__inc__;

    if (cachable && this.__anc__) return this.__anc__.slice();

    for (var i = 0, n = inc.length; i < n; i++)
      inc[i].ancestors(list);

    if (JS.indexOf(list, this) < 0)
      list.push(this);

    if (cachable) this.__anc__ = list.slice();
    return list;
  },

  lookup: function(name) {
    var cached = this.__mct__[name];
    if (cached && cached.slice) return cached.slice();

    var ancestors = this.ancestors(),
        methods   = [],
        fns;

    for (var i = 0, n = ancestors.length; i < n; i++) {
      fns = ancestors[i].__fns__;
      if (fns.hasOwnProperty(name)) methods.push(fns[name]);
    }
    this.__mct__[name] = methods.slice();
    return methods;
  },

  includes: function(module) {
    if (module === this) return true;

    var inc  = this.__inc__;

    for (var i = 0, n = inc.length; i < n; i++) {
      if (inc[i].includes(module))
        return true;
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
      if (!JS.isType(this.__fns__[field], JS.Method)) continue;
      if (JS.indexOf(methods, field) >= 0) continue;
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

