this.JS = this.JS || {};

JS.Package = function(loader) {
  var Set = JS.Package.OrderedSet;
  JS.Package._index(this);
  
  this._loader  = loader;
  this._deps    = new Set();
  this._uses    = new Set();
  this._names   = new Set();
  this._waiters = [];
  this._loading = false;
};

(function() {
  var Set = JS.Package.OrderedSet = function() {
    this._members = this.list = [];
    this._index = {};
  };

  Set.prototype.push = function(item) {
    var key   = (item.id !== undefined) ? item.id : item,
        index = this._index;
    
    if (index.hasOwnProperty(key)) return;
    index[key] = this._members.length;
    this._members.push(item);
  };
})();

(function(klass) {
  var instance = klass.prototype;
  
  instance.addDependency = function(pkg) {
    this._deps.push(pkg);
  };
  
  instance.addSoftDependency = function(pkg) {
    this._uses.push(pkg);
  };
  
  instance._getPackage = function(list, index) {
    var pkg = list[index];
    return klass.getByName(pkg);
  };
  
  instance.addName = function(name) {
    this._names.push(name);
    klass.getFromCache(name).pkg = this;
  };
  
  instance._depsComplete = function(deps) {
    deps = (deps || this._deps).list;
    var n = deps.length, dep;
    while (n--) {
      if (!this._getPackage(deps, n).isComplete()) return false;
    }
    return true;
  };
  
  instance.isComplete = function() {
    return this.isLoaded() &&
           this._depsComplete(this._deps) &&
           this._depsComplete(this._uses);
  };
  
  instance.isLoaded = function(withExceptions) {
    if (this._isLoaded) return true;
    
    var names = this._names.list,
        i     = names.length,
        name, object;
    
    while (i--) { name = names[i];
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
    return !this.isLoaded() && this._depsComplete();
  };
  
  instance.expand = function(set) {
    var deps, n;
    
    deps = this._deps.list; n = deps.length;
    while (n--) this._getPackage(deps, n).expand(set);
    
    set.push(this);
    
    deps = this._uses.list; n = deps.length;
    while (n--) this._getPackage(deps, n).expand(set);
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
    return 'Package:' + this._names.list.join(',');
  };
  
  klass._autoIncrement = 1;
  klass._env = this;
  klass._indexByPath = {};
  klass._indexByName = {};
  
  klass._index = function(pkg) {
    pkg.id = this._autoIncrement;
    this._autoIncrement += 1;
  };
  
  klass.getByPath = function(loader) {
    var path = loader.toString();
    return this._indexByPath[path] || (this._indexByPath[path] = new this(loader));
  };
  
  klass.getFromCache = function(name) {
    return this._indexByName[name] = this._indexByName[name] || {};
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
    var packages = new klass.OrderedSet(), i, n;
    for (i = 0, n = list.length; i < n; i++)
      list[i].expand(packages);
    return packages.list;
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

