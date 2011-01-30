JS.Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },
  
  setup: function() {
    var self = this;
    require = (function(origRequire) {
      return function() {
        self._currentPath = arguments[0] + '.js';
        return origRequire.apply(JS.Package.ENV, arguments);
      };
    })(require);
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    var cwd    = process.cwd(),
        module = path.replace(/\.[^\.]+$/g, ''),
        file   = require('path');
    
    require(file.join(cwd, module));
    fireCallbacks();
  }
};
