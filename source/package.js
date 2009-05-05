JS.Package = new JS.Class('Package', {
  initialize: function(loader) {
    this._loader  = loader;
    this._deps    = [];
    this._names   = [];
    this._waiters = [];
    this._loading = false;
  },
  
  addDependency: function(pkg) {
    if (typeof pkg === 'string') pkg = this.klass.getByName(pkg);
    if (!pkg) return;
    if (JS.indexOf(this._deps, pkg) === -1) this._deps.push(pkg);
  },
  
  addName: function(name) {
    if (!this.contains(name)) this._names.push(name);
  },
  
  contains: function(name) {
    return JS.indexOf(this._names, name) !== -1;
  },
  
  depsComplete: function() {
    var n = this._deps.length;
    while (n--) { if (!this._deps[n].isComplete()) return false; }
    return true;
  },
  
  isComplete: function() {
    return this.isLoaded() && this.depsComplete();
  },
  
  isLoaded: function(withExceptions) {
    var names = this._names, n = names.length, object;
    while (n--) {
      object = this.klass.getObject(names[n]);
      if (object !== undefined) continue;
      if (withExceptions)
        throw new Error('Expected package at ' + this._loader + ' to define ' + names[n]);
      else
        return false;
    }
    return true;
  },
  
  readyToLoad: function() {
    return !this.isLoaded() && this.depsComplete();
  },
  
  expand: function(list) {
    var deps = list || [], i, n;
    for (i = 0, n = this._deps.length; i < n; i++)
      this._deps[i].expand(deps);
    if (JS.indexOf(deps, this) === -1) deps.push(this);
    return deps;
  },
  
  load: function(callback, scope) {
    var self = this, handler = function() {
      self._loading = false;
      callback.call(scope || null);
    };
    
    if (this.isLoaded()) return setTimeout(handler, 1);
    
    this._waiters.push(handler);
    if (this._loading) return;
    
    var fireCallbacks = function() {
      self.isLoaded(true);
      for (var i = 0, n = self._waiters.length; i < n; i++) self._waiters[i]();
      self._waiters = [];
    };
    
    this._loading = true;
    
    if (JS.isFn(this._loader)) return this._loader(fireCallbacks);
    
    var tag  = document.createElement('script');
    tag.type = 'text/javascript';
    tag.src  = this._loader;
    
    tag.onload = tag.onreadystatechange = function() {
      if ( !tag.readyState ||
            tag.readyState === 'loaded' ||
            tag.readyState === 'complete' ||
            (tag.readyState === 4 && tag.status === 200)
      ) {
        fireCallbacks();
        tag = null;
      }
    };
    ;;; window.console && console.info('Loading ' + this._loader);
    document.getElementsByTagName('head')[0].appendChild(tag);
  },
  
  toString: function() {
    return 'Package:' + this._names[0];
  },
  
  extend: {
    _store:  {},
    _global: this,
    
    getByPath: function(loader) {
      var path = loader.toString();
      return this._store[path] || (this._store[path] = new this(loader));
    },
    
    getByName: function(name) {
      for (var path in this._store) {
        if (this._store[path].contains(name))
          return this._store[path];
      }
      return null;
    },
    
    getObject: function(name) {
      var object = this._global, parts = name.split('.'), part;
      while (part = parts.shift()) object = (object||{})[part];
      return object;
    },
    
    expand: function(list) {
      var packages = [];
      for (var i = 0, n = list.length; i < n; i++)
        list[i].expand(packages);
      return packages;
    },
    
    load: function(list, callback, scope) {
      var fired = false, handler = function() {
        if (!fired) callback.call(scope || null);
        fired = true;
      };
      
      var complete = this._filter(list, 'isComplete');
      if (complete.length === list.length) return setTimeout(handler, 1);
      
      var ready = this._filter(list, 'readyToLoad'), n = ready.length;
      while (n--) ready[n].load(function() { this.load(list, handler); }, this);
    },
    
    _filter: function(list, test) {
      var result = [], n = list.length;
      while (n--) { if (list[n][test]()) result.push(list[n]); }
      return result;
    },
    
    DSL: {
      pkg: function(name, path) {
        var pkg = path
            ? JS.Package.getByPath(path)
            : JS.Package.getByName(name);
        pkg.addName(name);
        return new JS.Package.Description(pkg);
      },
      
      file: function(path) {
        var pkg = JS.Package.getByPath(path);
        return new JS.Package.Description(pkg);
      }
    },
    
    Description: new JS.Class({
      initialize: function(pkg) {
        this._pkg = pkg;
      },
      
      requires: function() {
        var i = arguments.length;
        while (i--) this._pkg.addDependency(arguments[i]);
        return this;
      },
      
      provides: function() {
        var i = arguments.length;
        while (i--) this._pkg.addName(arguments[i]);
        return this;
      }
    })
  }
});

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};
 
require = function() {
  var args = JS.array(arguments), requirements = [];
  while (typeof args[0] === 'string') requirements.push(JS.Package.getByName(args.shift()));
  requirements = JS.Package.expand(requirements);
  JS.Package.load(requirements, args[0], args[1]);
};

