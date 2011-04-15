JS.Package.ServerLoader = {
  usable: function() {
    return typeof JS.Package._getObject('load') === 'function' &&
           typeof JS.Package._getObject('version') === 'function';
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    load(path);
    fireCallbacks();
  }
};
