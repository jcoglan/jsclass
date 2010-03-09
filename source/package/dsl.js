JS.Package.DSL = {
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
    JS.Package.Loader.loadFile(path, fireCallbacks);
  }
};

JS.Package.Description = function(pkg) {
  this._pkg = pkg;
};

(function(klass) {
  
  klass._batch = function(method, args) {
    var n = args.length, method = this._pkg[method], i;
    for (i = 0; i < n; i++) method.call(this._pkg, args[i]);
    return this;
  };
  
  klass.provides = function() {
    return this._batch('addName', arguments);
  };
  
  klass.requires = function() {
    return this._batch('addDependency', arguments);
  };
  
  klass.uses = function() {
    return this._batch('addSoftDependency', arguments);
  };
  
  klass.setup = function(block) {
    this._pkg.onload(block);
    return this;
  };
  
})(JS.Package.Description.prototype);

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};
 
JS.require = function() {
  var requirements = [], i = 0;
  
  while (typeof arguments[i] === 'string'){
    requirements.push(arguments[i]);
    i += 1;
  }
  
  JS.Package.when({complete: requirements}, arguments[i], arguments[i+1]);
};

require = JS.require;

