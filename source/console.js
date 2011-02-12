JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    
    __buffer__: '',
    __format__: '',
    
    ESCAPE_CODES: {
      reset:      0,
      bold:       1,
      underline:  4,
      normal:     22,
      noline:     24,
      black:      30,
      red:        31,
      green:      32,
      yellow:     33,
      blue:       34,
      magenta:    35,
      cyan:       36,
      white:      37,
      nocolor:    39
    },
    
    escape: function(string) {
      return this.ANSI_CSI + string;
    },
    
    flushFormat: function() {
      var format = this.__format__;
      this.__format__ = '';
      return format;
    },
    
    output: function(string, followon) {
      string = (string && string.toString() || '');
      if (string === '' && !followon) this.writeToStdout('');
      
      while (string.length > 0) {
        var length = followon ? this.__buffer__.length : 0,
            max    = this.MAX_BUFFER_LENGTH,
            escape = (!followon || length === 0) ? '' : this.escape('1F') + this.escape((length + 1) + 'G'),
            line   = string.substr(0, max - length);
        
        this.__buffer__ += line;
        if (this.__buffer__.length === max) this.__buffer__ = '';
        
        this.writeToStdout(escape + this.flushFormat() + line);
        string = string.substr(max - length);
      }
      if (!followon) this.__buffer__ = '';
    },
    
    writeToStdout: function(string) {
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    }
  },
  
  consoleFormat: function(escapeCode) {
    JS.Console.__format__ += JS.Console.escape(escapeCode + 'm');
  },
  
  puts: function(string) {
    JS.Console.output(string, false);
  },
  
  print: function(string) {
    JS.Console.output(string, true);
  }
});

(function() {
  var C = JS.Console;
  
  for (var key in C.ESCAPE_CODES) (function(key) {
    C.define(key, function() {
      var escape = C.ESCAPE_CODES[key];
      this.consoleFormat(escape);
    });
  })(key);
  
  C.extend(C);
})();
  