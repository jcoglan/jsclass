JS.Package.DomLoader = {
  usable: function() {
    return !!JS.Package.getObject('window.document.getElementsByTagName');
  },
  
  __FILE__: function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
  },
  
  loadFile: function(path, fireCallbacks) {
    if (typeof air === 'object') air.trace('Loading ' + path);
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
  jsloader:   '@mozilla.org/moz/jssubscript-loader;1',
  cssservice: '@mozilla.org/content/style-sheet-service;1',
  ioservice:  '@mozilla.org/network/io-service;1',
  
  usable: function() {
    try {
      var CC = (Components || {}).classes;
      return !!(CC && CC[this.jsloader] && CC[this.jsloader].getService);
    } catch(e) {
      return false;
    }
  },

  setup: function() {
    var Cc = Components.classes, Ci = Components.interfaces;
    this.ssl = Cc[this.jsloader].getService(Ci.mozIJSSubScriptLoader);
    this.sss = Cc[this.cssservice].getService(Ci.nsIStyleSheetService);
    this.ios = Cc[this.ioservice].getService(Ci.nsIIOService);
  },

  loadFile: function(path, fireCallbacks) {
    if (window.console && console.info)
      console.info('Loading ' + path);
    
    this.ssl.loadSubScript(path);
    fireCallbacks();
  },
  
  loadStyle: function(path) {
    var uri = this.ios.newURI(path, null, null);
    this.sss.loadAndRegisterSheet(uri, this.sss.USER_SHEET);
  }
};


JS.Package.RhinoLoader = {
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
    require(requirePath);
    fireCallbacks();
  }
};


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
        file   = require('path');
    
    var requirePath = file.join(cwd, module);
    this._currentPath = requirePath + '.js';
    require(requirePath);
    fireCallbacks();
  }
};


JS.Package.ServerLoader = {
  usable: function() {
    return typeof JS.Package.getObject('load') === 'function' &&
           typeof JS.Package.getObject('version') === 'function';
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
                      JS.Package.RhinoLoader,
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

