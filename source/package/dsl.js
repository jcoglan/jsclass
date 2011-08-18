JS.Package.DSL = {
  __FILE__: function() {
    return JS.Package.Loader.__FILE__();
  },
  
  pkg: function(name, path) {
    var pkg = path
        ? JS.Package._getByPath(path)
        : JS.Package._getByName(name);
    pkg.provides(name);
    return pkg;
  },
  
  file: function(path) {
    return JS.Package._getByPath(path);
  },
  
  load: function(path, fireCallbacks) {
    JS.Package.Loader.loadFile(path, fireCallbacks);
  },
  
  autoload: function(pattern, options) {
    JS.Package._autoload(pattern, options);
  }
};

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};

JS.cacheBust = false;

JS.load = function(url, callback) {
  JS.Package.Loader.loadFile(url, function() {
    if (typeof callback === 'function') callback();
  });
  return this;
};
 
JS.require = function() {
  var requirements = [], i = 0;
  
  while (typeof arguments[i] === 'string'){
    requirements.push(arguments[i]);
    i += 1;
  }
  var callback = arguments[i], context = arguments[i+1];
  
  JS.Package.when({complete: requirements}, function(objects) {
    if (!callback) return;
    callback.apply(context || null, objects && objects.complete);
  });
  
  return this;
};

