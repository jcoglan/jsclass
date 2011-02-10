JS.Package.ServerLoader = {
  usable: function() {
    return typeof JS.Package.getObject('load') === 'function' &&
           typeof JS.Package.getObject('version') === 'function';
  },
  
  setup: function() {
    var self = this;
    load = (function(origLoad) {
      return function() {
        self._currentPath = arguments[0];
        return origLoad.apply(JS.Package.ENV, arguments);
      };
    })(load);
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    load(path);
    fireCallbacks();
  }
};
