this.JS = this.JS || {};

JS.Package = function(loader) {
  this._loader  = loader;
  this._deps    = [];
  this._uses    = [];
  this._names   = {};
  this._waiters = [];
  this._loading = false;
};

(function(klass) {
  var instance = klass.prototype;
  
  instance.addDependency = function(pkg) {
    if (klass.indexOf(this._deps, pkg) === -1) this._deps.push(pkg);
  };
  
  instance.addSoftDependency = function(pkg) {
    if (klass.indexOf(this._uses, pkg) === -1) this._uses.push(pkg);
  };
  
  instance._getPackage = function(list, index) {
    var pkg = list[index];
    if (typeof pkg === 'string') pkg = list[index] = klass.getByName(pkg);
    return pkg;
  };
  
  instance.addName = function(name) {
    this._names[name] = true;
    klass.getFromCache(name).pkg = this;
  };
  
  instance.depsComplete = function(deps) {
    deps = deps || this._deps;
    var n = deps.length, dep;
    while (n--) {
      if (!this._getPackage(deps, n).isComplete()) return false;
    }
    return true;
  };
  
  instance.isComplete = function() {
    return this.isLoaded() &&
           this.depsComplete(this._deps) &&
           this.depsComplete(this._uses);
  };
  
  instance.isLoaded = function(withExceptions) {
    if (this._isLoaded) return true;
    
    var names = this._names, name, object;
    
    for (name in names) {
      if (!names.hasOwnProperty(name)) continue;
      object = klass.getObject(name);
      if (object !== undefined) continue;
      if (withExceptions)
        throw new Error('Expected package at ' + this._loader + ' to define ' + name);
      else
        return false;
    }
    return this._isLoaded = true;
  };
  
  instance.readyToLoad = function() {
    return !this.isLoaded() && this.depsComplete();
  };
  
  instance.expand = function(list) {
    var deps = list || [], dep, n;
    
    n = this._deps.length;
    while (n--) this._getPackage(this._deps, n).expand(deps);
    
    if (klass.indexOf(deps, this) === -1) deps.push(this);
    
    n = this._uses.length;
    while (n--) this._getPackage(this._uses, n).expand(deps);
    
    return deps;
  };
  
  instance.onload = function(block) {
    this._onload = block;
  };
  
  instance.load = function(callback, context) {
    if (this._loader === undefined)
      throw new Error('No load path specified for ' + this.toString());
    
    var self = this, handler, fireCallbacks;
    
    handler = function() {
      self._loading = false;
      callback.call(context || null);
    };
    
    if (this.isLoaded()) return setTimeout(handler, 1);
    
    this._waiters.push(handler);
    if (this._loading) return;
    
    fireCallbacks = function() {
      if (typeof self._onload === 'function') self._onload();
      self.isLoaded(true);
      for (var i = 0, n = self._waiters.length; i < n; i++) self._waiters[i]();
      self._waiters = [];
    };
    
    this._loading = true;
    
    typeof this._loader === 'function'
        ? this._loader(fireCallbacks)
        : klass.Loader.loadFile(this._loader, fireCallbacks);
  };
  
  instance.toString = function() {
    var names = [], name;
    for (name in this._names) {
      if (this._names.hasOwnProperty(name)) names.push(name);
    }
    return 'Package:' + names.join(',');
  };
  
  klass.indexOf = function(list, item) {
    if (list.indexOf) return list.indexOf(item);
    for (var i = 0, n = list.length; i < n; i++) {
      if (list[i] === item) return i;
    }
    return -1;
  };
  
  klass._store =  {};
  klass._cache =  {},
  klass._env   =  this;
  
  klass.getByPath = function(loader) {
    var path = loader.toString();
    return this._store[path] || (this._store[path] = new this(loader));
  };
  
  klass.getFromCache = function(name) {
    return this._cache[name] = this._cache[name] || {};
  };
  
  klass.getByName = function(name) {
    var cached = this.getFromCache(name);
    if (cached.pkg) return cached.pkg;
    
    var placeholder = new this();
    placeholder.addName(name);
    return placeholder;
  };
  
  klass.getObject = function(name) {
    var cached = this.getFromCache(name);
    if (cached.obj !== undefined) return cached.obj;
    
    var object = this._env,
        parts  = name.split('.'), part;
    
    while (part = parts.shift()) object = object && object[part];
    
    return this.getFromCache(name).obj = object;
  };
  
  klass.expand = function(list) {
    var packages = [], i, n;
    for (i = 0, n = list.length; i < n; i++)
      list[i].expand(packages);
    return packages;
  };
  
  klass.load = function(list, counter, callback) {
    var ready    = [],
        deferred = [],
        n        = list.length,
        pkg;
    
    while (n--) {
      pkg = list[n];
      if (pkg.isComplete())
        counter -= 1;
      else
        (pkg.readyToLoad() ? ready : deferred).push(pkg);
    }
    
    if (counter === 0) return callback();
    
    n = ready.length;
    while (n--) ready[n].load(function() {
      this.load(deferred, --counter, callback);
    }, this);
  };
  
})(JS.Package);

