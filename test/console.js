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

JSCLASS_PATH = 'build/min/'

if (typeof require === 'function') {
  require('../' + JSCLASS_PATH + 'loader')
  require('./runner')
} else {
  load(JSCLASS_PATH + 'loader.js')
  load('test/runner.js')
}

