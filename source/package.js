JS.Package = new JS.Class({
  initialize: function(name) {
    this.name = name;
    this.deps = [];
    this.klass.store[name] = this;
  },
  
  addDependency: function(dep) {
    if (this.expand().indexOf(dep) == -1) this.deps.push(dep);
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
    var n = this.deps.length;
    while (n--) { if (!this.deps[n].isLoaded()) return false; }
    return this.getObject() !== undefined;
  },
  
  expand: function(list) {
    var deps = list || [], i, n;
    for (i = 0, n = this.deps.length; i < n; i++)
      this.deps[i].expand(deps);
    if (deps.indexOf(this) == -1) deps.push(this);
    return deps;
  },
  
  extend: {
    store: {},
    root: this,
    
    get: function(name) {
      return this.store[name] || new this(name);
    },
    
    DSL: {
      pkg: function(name) {
        return new JS.Package.Description(name);
      }
    },
    
    Description: new JS.Class({
      initialize: function(name) {
        this.pkg = JS.Package.get(name);
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

