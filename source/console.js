JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    __buffer__: [],
    
    ESCAPE_CODES: {
      reset:    0,
      bold:     1,
      normal:   22,
      black:    30,
      red:      31,
      green:    32,
      yellow:   33,
      blue:     34,
      magenta:  35,
      cyan:     36,
      white:    37,
      nocolor:  39
    },

    escape: function(string) {
      return this.ANSI_CSI + string;
    },
    
    bufferSize: function() {
      var size   = 0,
          buffer = this.__buffer__,
          n      = buffer.length;
      
      while (n--) size += buffer[n].length;
      return size;
    },
    
    bufferChunk: function(size) {
      var text   = '',
          length = 0,
          buffer = this.__buffer__,
          next;
      
      while (length < size && buffer.length > 0) {
        next = buffer[0];
        if (length + next.length <= size) {
          text   += next.text;
          length += next.length;
          buffer.shift();
        } else {
          text       += next.text.substr(0, size - length);
          length     += next.length;
          next.text   = next.text.substr(size - length);
          next.length = next.text.length;
        }
      }
      return text;
    },
    
    bufferText: function() {
      var text = '', buffer = this.__buffer__;
      for (var i = 0, n = buffer.length; i < n; i++) text += buffer[i].text;
      return text;
    }
  },
  
  emitFormat: function(escapeCode) {
    var text     = JS.Console.escape(escapeCode + 'm'),
        buffer   = JS.Console.__buffer__,
        wasEmpty = (JS.Console.bufferSize() === 0);
    
    if (typeof process === 'object') return require('sys').print(text);
    JS.Console.__buffer__.push({text: text, length: 0});
    
    if (wasEmpty) return;
    
    var esc = JS.Console.escape('F') + JS.Console.escape('K');
    this.writeToStdout(esc + JS.Console.bufferText());
  },
  
  puts: function(string) {
    if (JS.Console.bufferSize() === 0)
      string = JS.Console.bufferText() + string;
    
    JS.Console.__buffer__ = [];
    this.writeToStdout(string);
  },
  
  print: function(string) {
    if (typeof process === 'object') return require('sys').print(string);
    
    var buffer   = JS.Console.__buffer__,
        wasEmpty = (JS.Console.bufferSize() === 0),
        max      = JS.Console.MAX_BUFFER_LENGTH;
    
    buffer.push({text: string, length: string.length});
    
    while (JS.Console.bufferSize() > max)
      this.writeToStdout(JS.Console.bufferChunk(max));
    
    var esc = wasEmpty ? '' : JS.Console.escape('F') + JS.Console.escape('K');
    this.writeToStdout(esc + JS.Console.bufferText());
  },
  
  writeToStdout: function(string) {
    if (typeof process === 'object')    return require('sys').puts(string);
    if (typeof WScript !== 'undefined') return WScript.Echo(string);
    if (typeof print === 'function')    return print(string);
  }
});

(function() {
  for (var key in JS.Console.ESCAPE_CODES) (function(key) {
    JS.Console.define(key, function() {
      this.emitFormat(JS.Console.ESCAPE_CODES[key]);
    });
  })(key);
})();

JS.Console.extend(JS.Console);
