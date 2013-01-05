Package.RhinoLoader = {
  usable: function() {
    return typeof java === 'object' &&
           typeof require === 'function';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var cwd    = java.lang.System.getProperty('user.dir'),
        module = path.replace(/\.[^\.]+$/g, '');

    var requirePath = new java.io.File(cwd, module).toString();
    this._currentPath = requirePath + '.js';
    var module = require(requirePath);
    fireCallbacks(module);

    return module;
  }
};

