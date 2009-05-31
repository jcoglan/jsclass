JS.Package = new JS.Class('Package', {
  initialize: function(loader) {
    this._loader  = loader;
    this._deps    = [];
    this._uses    = [];
    this._names   = [];
    this._waiters = [];
    this._loading = false;
  },
  
  addDependency: function(pkg) {
    if (JS.indexOf(this._deps, pkg) === -1) this._deps.push(pkg);
  },
  
  addSoftDependency: function(pkg) {
    if (JS.indexOf(this._uses, pkg) === -1) this._uses.push(pkg);
  },
  
  _getPackage: function(list, index) {
    var pkg = list[index];
    if (typeof pkg === 'string') pkg = list[index] = this.klass.getByName(pkg);
    return pkg;
  },
  
  addName: function(name) {
    if (!this.contains(name)) this._names.push(name);
  },
  
  contains: function(name) {
    return JS.indexOf(this._names, name) !== -1;
  },
  
  depsComplete: function(deps) {
    deps = deps || this._deps;
    var n = deps.length, dep;
    while (n--) {
      if (!this._getPackage(deps, n).isComplete()) return false;
    }
    return true;
  },
  
  isComplete: function() {
    return this.isLoaded() &&
           this.depsComplete(this._deps) &&
           this.depsComplete(this._uses);
  },
  
  isLoaded: function(withExceptions) {
    if (this._isLoaded) return true;
    
    var names = this._names,
        n     = names.length,
        object;
    
    while (n--) {
      object = this.klass.getObject(names[n]);
      if (object !== undefined) continue;
      if (withExceptions)
        throw new Error('Expected package at ' + this._loader + ' to define ' + names[n]);
      else
        return false;
    }
    return this._isLoaded = true;
  },
  
  readyToLoad: function() {
    return !this.isLoaded() && this.depsComplete();
  },
  
  expand: function(list) {
    var deps = list || [], dep, n;
    n = this._deps.length;
    while (n--) this._getPackage(this._deps, n).expand(deps);
    if (JS.indexOf(deps, this) === -1) deps.push(this);
    n = this._uses.length;
    while (n--) this._getPackage(this._uses, n).expand(deps);
    return deps;
  },
  
  onload: function(block) {
    this._onload = block;
  },
  
  load: function(callback, context) {
    var self = this, handler, fireCallbacks;
    
    handler = function() {
      self._loading = false;
      callback.call(context || null);
    };
    
    if (this.isLoaded()) return setTimeout(handler, 1);
    
    this._waiters.push(handler);
    if (this._loading) return;
    
    fireCallbacks = function() {
      if (JS.isFn(self._onload)) self._onload();
      self.isLoaded(true);
      for (var i = 0, n = self._waiters.length; i < n; i++) self._waiters[i]();
      self._waiters = [];
    };
    
    this._loading = true;
    
    JS.isFn(this._loader)
        ? this._loader(fireCallbacks)
        : this.klass.Loader.loadFile(this._loader, fireCallbacks);
  },
  
  toString: function() {
    return 'Package:' + this._names[0];
  },
  
  extend: {
    _store:   {},
    _env:     this,
    
    getByPath: function(loader) {
      var path = loader.toString();
      return this._store[path] || (this._store[path] = new this(loader));
    },
    
    getByName: function(name) {
      for (var path in this._store) {
        if (this._store[path].contains(name))
          return this._store[path];
      }
      throw new Error('Could not find package containing ' + name);
    },
    
    getObject: function(name) {
      var object = this._env,
          parts  = name.split('.'), part;
      
      while (part = parts.shift()) object = (object||{})[part];
      return object;
    },
    
    expand: function(list) {
      var packages = [], i, n;
      for (i = 0, n = list.length; i < n; i++)
        list[i].expand(packages);
      return packages;
    },
    
    load: function(list, counter, callback) {
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
    }
  }
});

