JS.Package.DomLoader = {
  usable: function() {
    return !!JS.Package.getObject('window.document.getElementsByTagName');
  },
  
  __FILE__: function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
  },
  
  loadFile: function(path, fireCallbacks) {
    if (window.console && console.info)
      console.info('Loading ' + path);
    
    var self   = this,
        script = document.createElement('script');
    
    script.type = 'text/javascript';
    script.src  = path;
    
    script.onload = script.onreadystatechange = function() {
      var state = script.readyState, status = script.status;
      if ( !state || state === 'loaded' || state === 'complete' ||
           (state === 4 && status === 200) ) {
        fireCallbacks();
        script.onload = script.onreadystatechange = self._K;
        script = null;
      }
    };
    
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  
  loadStyle: function(path) {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    
    document.getElementsByTagName('head')[0].appendChild(link);
  },
  
  _K: function() {}
};

JS.Package.MozIJSSubScriptLoader = {
  usable: function() {
    try {
      if ( Components &&
           Components.classes &&
           Components.classes['@mozilla.org/moz/jssubscript-loader;1'] &&
           Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService ) {
        return true;
      } else {
        return false;
      }
    } catch(e) {
      return false;
    }
  },

  setup: function() {
    this.mozLoader = Components.
                     classes['@mozilla.org/moz/jssubscript-loader;1'].
                     getService(Components.interfaces.mozIJSSubScriptLoader);
  },

  loadFile: function(path, fireCallbacks) {
    if (window.console && console.info)
      console.info('Loading ' + path);
    
    this.mozLoader.loadSubScript(path);
    fireCallbacks();
  }
};


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
    var node   = (typeof process === 'object'),
        cwd    = node ? process.cwd() : require('file').cwd(),
        module = path.replace(/\.[^\.]+$/g, ''),
        file   = node ? require('path') : require('file');
    
    require(file.join(cwd, module));
    fireCallbacks();
  }
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

JS.Package.WshLoader = {
  usable: function() {
    return !!JS.Package.getObject('ActiveXObject') &&
           !!JS.Package.getObject('WScript');
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
    try {
      file   = fso.OpenTextFile(path);
      runner = function() { eval(file.ReadAll()) };
      runner();
      fireCallbacks();
    } finally {
      try { if (file) file.Close() } catch (e) {}
    }
  }
};

(function() {
  var candidates = [  JS.Package.MozIJSSubScriptLoader,
                      JS.Package.DomLoader,
                      JS.Package.CommonJSLoader,
                      JS.Package.ServerLoader,
                      JS.Package.WshLoader ],
      
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

