Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var file, module;

    if (typeof process !== 'undefined') {
      module = path.replace(/\.[^\.]+$/g, '');
      file   = require('path').resolve(module);
    }
    else if (typeof phantom !== 'undefined') {
      file = phantom.libraryPath.replace(/\/$/, '') + '/' +
             path.replace(/^\//, '');
    }

    this._currentPath = file + '.js';
    var module = require(file);
    fireCallbacks(module);

    return module;
  }
};

