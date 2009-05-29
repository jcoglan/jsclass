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
        : this.klass.loadFile(this._loader, fireCallbacks);
  },
  
  toString: function() {
    return 'Package:' + this._names[this._names.length - 1];
  },
  
  extend: {
    _store:   {},
    _global:  this,
    _K:       function() {},
    
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
      var object = this._global,
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
    },
    
    loadFile: function(path, fireCallbacks) {
      var self = this,
          tag  = document.createElement('script');
      
      tag.type = 'text/javascript';
      tag.src  = path;
      
      tag.onload = tag.onreadystatechange = function() {
        var state = tag.readyState, status = tag.status;
        if ( !state || state === 'loaded' || state === 'complete' || (state === 4 && status === 200) ) {
          fireCallbacks();
          tag.onload = tag.onreadystatechange = self._K;
          tag = null;
        }
      };
      ;;; window.console && console.info('Loading ' + path);
      document.getElementsByTagName('head')[0].appendChild(tag);
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
      },
      
      load: function(path, fireCallbacks) {
        JS.Package.loadFile(path, fireCallbacks);
      }
    },
    
    Description: new JS.Class({
      initialize: function(pkg) {
        this._pkg = pkg;
      },
      
      _batch: function(method, args) {
        var i = args.length, method = this._pkg[method];
        while (i--) method.call(this._pkg, args[i]);
        return this;
      },
      
      provides: function() {
        return this._batch('addName', arguments);
      },
      
      requires: function() {
        return this._batch('addDependency', arguments);
      },
      
      uses: function() {
        return this._batch('addSoftDependency', arguments);
      },
      
      setup: function(block) {
        this._pkg.onload(block);
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
  var args         = JS.array(arguments),
      requirements = [];
  
  while (typeof args[0] === 'string') requirements.push(JS.Package.getByName(args.shift()));
  requirements = JS.Package.expand(requirements);
  
  var fired = false, handler = function() {
    if (fired) return;
    fired = true;
    args[0] && args[0].call(args[1] || null);
  };
  
  JS.Package.load(requirements, requirements.length, handler);
};

