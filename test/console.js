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
  var $ = (typeof global === 'object') ? global : this,
      path = $.JSCLASS_PATH = 'build/src/';

  if (typeof phantom !== 'undefined') {
    $.JSCLASS_PATH = '../' + $.JSCLASS_PATH;
    $.CWD = '..';
  }

  if (typeof require === 'function') {
    $.PKG = require('../' + path + 'loader');
    require('./runner');
  } else {
    load(path + 'loader.js');
    load('test/runner.js');
  }
})();

