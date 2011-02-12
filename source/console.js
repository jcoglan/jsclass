JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    
    BROWSER: (typeof window !== 'undefined'),
    NODE:    (typeof process === 'object'),
    WINDOZE: (typeof WScript !== 'undefined'),
    
    __buffer__: '',
    __format__: '',
    
    ESCAPE_CODES: {
      reset:      0,
      bold:       1,    normal:       22,
      underline:  4,    noline:       24,
      blink:      5,    noblink:      25,
      
      black:      30,   bgblack:      40,
      red:        31,   bgred:        41,
      green:      32,   bggreen:      42,
      yellow:     33,   bgyellow:     43,
      blue:       34,   bgblue:       44,
      magenta:    35,   bgmagenta:    45,
      cyan:       36,   bgcyan:       46,
      white:      37,   bgwhite:      47,
      nocolor:    39,   bgnocolor:    49
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
      if (this.WINDOZE && !followon && this.__buffer__)
        this.writeToStdout(this.__buffer__);
      
      string = (string && string.toString() || '');
      if (string === '' && !followon) this.writeToStdout('');
      
      while (string.length > 0) {
        var length  = this.__buffer__.length,
            max     = this.MAX_BUFFER_LENGTH,
            movable = (length > 0 && !this.WINDOZE),
            escape  = movable ? this.escape('1F') + this.escape((length + 1) + 'G') : '',
            line    = string.substr(0, max - length);
        
        this.__buffer__ += line;
        if (this.__buffer__.length === max) {
          if (this.WINDOZE && followon) this.writeToStdout(this.__buffer__);
          this.__buffer__ = '';
        }
        
        if (!this.WINDOZE || !followon)
          this.writeToStdout(escape + this.flushFormat() + line);
        
        string = string.substr(max - length);
      }
      if (!followon) this.__buffer__ = '';
    },
    
    writeToStdout: function(string) {
      if (this.BROWSER && window.runtime) return window.runtime.trace(string);
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    }
  },
  
  consoleLog: function(string) {
    if (typeof console !== 'undefined')
      console.log(string);
    else
      alert(string);
  },
  
  consoleFormat: function() {
    this.reset();
    var i = arguments.length;
    while (i--) this[arguments[i]]();
  },
  
  puts: function(string) {
    var C = JS.Console;
    if (C.BROWSER && !window.runtime) return this.consoleLog(string);
    if (!C.NODE) return C.output(string, false);
    require('sys').puts(C.flushFormat() + string);
    C.__print__ = false;
  },
  
  print: function(string) {
    var C = JS.Console;
    if (C.BROWSER && !window.runtime) return this.consoleLog(string);
    if (!C.NODE) return C.output(string, true);
    require('sys').print(C.flushFormat() + string);
    C.__print__ = true;
  }
});

(function() {
  var C = JS.Console;
  
  for (var key in C.ESCAPE_CODES) (function(key) {
    C.define(key, function() {
      if ((C.BROWSER && !window.runtime) || C.WINDOZE) return;
      var escape = C.ESCAPE_CODES[key];
      C.__format__ += C.escape(escape + 'm');
    });
  })(key);
  
  C.extend(C);
})();
