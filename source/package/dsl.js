JS.Package.extend({
  DSL: {
    __FILE__: function() {
      return JS.Package.Loader.__FILE__();
    },
    
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
      var n = args.length, method = this._pkg[method], i;
      for (i = 0; i < n; i++) method.call(this._pkg, args[i]);
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
});

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};
 
JS.require = function() {
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

require = JS.require;

