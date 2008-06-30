JS.Package = new JS.Class({
  initialize: function(path) {
    this._path = path;
    this._deps = [];
    this._names = [];
  },
  
  addDependency: function(pkg) {
    if (typeof pkg == 'string') pkg = this.klass.getByName(pkg);
    if (!pkg) return;
    if (this._deps.indexOf(pkg) == -1) this._deps.push(pkg);
  },
  
  addName: function(name) {
    if (!this.contains(name)) this._names.push(name);
  },
  
  contains: function(name) {
    return this._names.indexOf(name) != -1;
  },
  
  getObjects: function() {
    var objects = [], n = this._names.length, object;
    while (n--) {
      object = this.klass.getObject(this._names[n]);
      if (object) objects.push(object);
    }
    return objects;
  },
  
  isLoaded: function(deep) {
    var n = this._deps.length;
    if (deep !== false) {
      while (n--) { if (!this._deps[n].isLoaded()) return false; }
    }
    return this.getObjects().length == this._names.length;
  },
  
  expand: function(list) {
    var deps = list || [], i, n;
    for (i = 0, n = this._deps.length; i < n; i++)
      this._deps[i].expand(deps);
    if (deps.indexOf(this) == -1) deps.push(this);
    return deps;
  },
  
  inject: function(callback, scope) {
    if (this.isLoaded(false)) return callback.call(scope || null);
    var tag     = document.createElement('script');
    tag.type    = 'text/javascript';
    tag.src     = this._path;
    tag.onload  = function() { callback.call(scope || null) };
    ;;; window.console && console.info('Loading ' + this._path);
    document.getElementsByTagName('head')[0].appendChild(tag);
    tag = null;
  },
  
  extend: {
    _store: {},
    _root: this,
    
    getByPath: function(path) {
      return this._store[path] || (this._store[path] = new this(path));
    },
    
    getByName: function(name) {
      for (var path in this._store) {
        if (this._store[path].contains(name))
          return this._store[path];
      }
      return null;
    },
    
    getObject: function(name) {
      var object = this._root, parts = name.split('.'), part;
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
      var i, n = list.length, loaded = 0;
      for (i = 0; i < n; i++) {
        list[i].inject(function() {
          loaded += 1;
          if (loaded == n) callback.call(scope || null);
        });
      }
    },
    
    DSL: {
      pkg: function(name, path) {
        var pkg = path
            ? JS.Package.getByPath(path)
            : JS.Package.getByName(name);
        pkg.addName(name);
        return new JS.Package.Description(pkg);
      }
    },
    
    Description: new JS.Class({
      initialize: function(pkg) {
        this._pkg = pkg;
      },
      
      requires: function(name) {
        this._pkg.addDependency(name);
        return this;
      }
    })
  }
});

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};

require = function() {
  var args = JS.array(arguments), requirements = [];
  while (typeof args[0] == 'string') requirements.push(JS.Package.getByName(args.shift()));
  requirements = JS.Package.expand(requirements);
  JS.Package.load(requirements, args[0], args[1]);
};

