JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    __buffer__: '',

    printToStdout: function(string) {
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    },

    escape: function(string) {
      return this.ANSI_CSI + string;
    }
  },
  
  puts: function(string) {
    JS.Console.__buffer__ = '';
    JS.Console.printToStdout(string);
  },
  
  print: function(string) {
    if (typeof process === 'object') return require('sys').print(string);
    
    JS.Console.__buffer__ += string;
    
    var buffer = JS.Console.__buffer__,
        max    = JS.Console.MAX_BUFFER_LENGTH;
    
    while (buffer.length >= max) {
      var line = buffer.substr(0, max);
      buffer = buffer.substr(max);
      this.puts(line);
    }
    
    JS.Console.__buffer__ = buffer;
    if (buffer === '') return;
    
    var esc = JS.Console.escape('F') + JS.Console.escape('K');
    JS.Console.printToStdout(esc + buffer);
  }
});

JS.Console.extend(JS.Console);
