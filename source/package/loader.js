JS.Package.DomLoader = {
  usable: function() {
    return !!JS.Package.getObject('window.document.getElementsByTagName');
  },
  
  __FILE__: function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
  },
  
  loadFile: function(path, fireCallbacks) {
    var self = this,
        tag = document.createElement('script');
    
    tag.type = 'text/javascript';
    tag.src = path;
    
    tag.onload = tag.onreadystatechange = function() {
      var state = tag.readyState, status = tag.status;
      if ( !state || state === 'loaded' || state === 'complete' || (state === 4 && status === 200) ) {
        fireCallbacks();
        tag.onload = tag.onreadystatechange = self._K;
        tag = null;
      }
    };
    window.console && console.info('Loading ' + path);
    document.getElementsByTagName('head')[0].appendChild(tag);
  },
  
  _K: function() {}
};

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
        return origLoad.apply(JS.Package._env, arguments);
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

(function() {
  var candidates = [  JS.Package.DomLoader,
                      JS.Package.ServerLoader ],
      
      n = candidates.length,
      i, candidate;
  
  for (i = 0; i < n; i++) {
    candidate = candidates[i];
    if (candidate.usable()) {
      JS.Package.Loader = candidate;
      if (candidate.setup) candidate.setup();
      break;
    }
  }
})();

