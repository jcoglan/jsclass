var DSL = {
  __FILE__: function() {
    return Package.loader.__FILE__();
  },

  pkg: function(name, path) {
    var pkg = path
        ? Package._getByPath(path)
        : Package._getByName(name);
    pkg.provides(name);
    return pkg;
  },

  file: function() {
    return Package._getByPath.apply(Package, arguments);
  },

  load: function(path, fireCallbacks) {
    Package.loader.loadFile(path, fireCallbacks);
  },

  autoload: function(pattern, options) {
    Package._autoload(pattern, options);
  }
};

DSL.files  = DSL.file;
DSL.loader = DSL.file;

var packages = function(declaration) {
  declaration.call(DSL);
};

exports.load = function(path, callback) {
  return Package.loader.loadFile(path, callback || function() {});
};

exports.require = function() {
  var requirements = [], i = 0;

  while (typeof arguments[i] === 'string'){
    requirements.push(arguments[i]);
    i += 1;
  }
  var callback = arguments[i], context = arguments[i+1];

  Package.when({complete: requirements}, function(objects) {
    if (!callback) return;
    callback.apply(context || null, objects && objects.complete);
  });

  return this;
};

