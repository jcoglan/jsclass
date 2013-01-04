if (this.ActiveXObject) load = function(path) {
  var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
  try {
    file   = fso.OpenTextFile(path);
    runner = function() { eval(file.ReadAll()) };
    runner();
  } finally {
    try { if (file) file.Close() } catch (e) {}
  }
};

(function() {
  var $ = (typeof global === 'object') ? global : this;

  if (typeof phantom !== 'undefined') {
    $.JSCLASS_PATH = '../build/src/';
    $.CWD = '..';
  } else {
    $.JSCLASS_PATH = 'build/src/';
  }

  $.loadModule = function(name) {
    return JS.Package.loadFile(JSCLASS_PATH + name);
  };
})();

if (typeof phantom !== 'undefined') {
  require(JSCLASS_PATH + 'loader');
  require('./runner');
} else if (typeof require === 'function') {
  require('../' + JSCLASS_PATH + 'loader');
  require('./runner');
} else {
  load(JSCLASS_PATH + 'loader.js');
  load('test/runner.js');
}

