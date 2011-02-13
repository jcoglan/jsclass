JS.Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    var cwd    = process.cwd(),
        module = path.replace(/\.[^\.]+$/g, ''),
        path   = require('path'),
        file   = path.join(cwd, module);
    
    this._currentPath = file + '.js';
    fireCallbacks(require(file));
  }
};
