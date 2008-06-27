JS.Package = new JS.Class({
  include: JS.Observable,
  
  initialize: function(name) {
    this.name = name;
    this._deps = [];
    this.klass.store[name] = this;
  },
  
  addDependency: function(dep) {
    if (this.expand().indexOf(dep) == -1) this._deps.push(dep);
  },
  
  setLocation: function(path) {
    this._path = path;
  },
  
  getObject: function() {
    var object = this.klass.root, parts = this.name.split('.');
    for (var i = 0, n = parts.length; i < n; i++) {
      object = object[parts[i]];
      if (object === undefined) return object;
    }
    return object;
  },
  
  isLoaded: function() {
    var n = this._deps.length;
    while (n--) { if (!this._deps[n].isLoaded()) return false; }
    return this.getObject() !== undefined;
  },
  
  expand: function(list) {
    var deps = list || [], i, n;
    for (i = 0, n = this._deps.length; i < n; i++)
      this._deps[i].expand(deps);
    if (deps.indexOf(this) == -1) deps.push(this);
    return deps;
  },
  
  load: function(callback, scope, deep) {
    if (this.isLoaded()) return callback.call(scope || null);
    var packages = this.expand();
  },
  
  _inject: function() {
    if (this.getObject() !== undefined) return;
    var tag    = document.createElement('script');
    tag.type   = 'text/javascript';
    tag.src    = this._path;
    tag.onload = this.method('notifyObservers');
    document.getElementsByTagName('head')[0].appendChild(tag);
  },
  
  extend: {
    store: {},
    root: this,
    
    get: function(name) {
      return this.store[name] || new this(name);
    },
    
    DSL: {
      pkg: function(name) {
        return new JS.Package.Description(name, path);
      }
    },
    
    Description: new JS.Class({
      initialize: function(name, path) {
        this.pkg = JS.Package.get(name);
        if (path) this.pkg.setLocation(path);
      },
      
      requires: function() {
        var names = JS.array(arguments), i, n;
        for (i = 0, n = names.length; i < n; i++)
          this.pkg.addDependency(JS.Package.get(names[i]));
        return this;
      }
    })
  }
});

JS.Packages = function(declarations) {
  declarations.call(JS.Package.DSL);
};
