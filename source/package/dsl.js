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

  file: function(filename) {
    var files = [], i = arguments.length;
    while (i--) files[i] = resolve(arguments[i]);
    return Package._getByPath.apply(Package, files);
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

var parseLoadArgs = function(args) {
 var files = [], i = 0;

  while (typeof args[i] === 'string'){
    files.push(args[i]);
    i += 1;
  }

  return {files: files, callback: args[i], context: args[i+1]};
};

exports.load = function(path, callback) {
  var args = parseLoadArgs(arguments),
      n    = args.files.length;

  var loadNext = function(index) {
    if (index === n) return args.callback.call(args.context);
    Package.loader.loadFile(args.files[index], function() {
      loadNext(index + 1);
    });
  };
  loadNext(0);
};

exports.require = function() {
  var args = parseLoadArgs(arguments);

  Package.when({complete: args.files}, function(objects) {
    if (!args.callback) return;
    args.callback.apply(args.context, objects && objects.complete);
  });

  return this;
};

