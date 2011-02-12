JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    WINDOZE: (typeof WScript !== 'undefined'),
    
    __buffer__: [],
    __format__: {},
    
    ESCAPE_CODES: {
      reset:      {code: 0,   color: true,  weight: true,   decoration: true},
      bold:       {code: 1,                 weight: true},
      underline:  {code: 4,                                 decoration: true},
      normal:     {code: 22,                weight: true},
      noline:     {code: 24,                                decoration: true},
      black:      {code: 30,  color: true},
      red:        {code: 31,  color: true},
      green:      {code: 32,  color: true},
      yellow:     {code: 33,  color: true},
      blue:       {code: 34,  color: true},
      magenta:    {code: 35,  color: true},
      cyan:       {code: 36,  color: true},
      white:      {code: 37,  color: true},
      nocolor:    {code: 39,  color: true}
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
          next.text   = next.text.substr(size - length);
          length      = size;
          next.length = next.text.length;
        }
      }
      var formats = [], F = this.__format__;
      
      if (F.color)      formats.push({text: this.escape(F.color      + 'm'), length: 0});
      if (F.decoration) formats.push({text: this.escape(F.decoration + 'm'), length: 0});
      if (F.weight)     formats.push({text: this.escape(F.weight     + 'm'), length: 0});
      
      this.__buffer__ = formats.concat(buffer);
      
      return text;
    },
    
    bufferText: function() {
      var text = '', buffer = this.__buffer__;
      for (var i = 0, n = buffer.length; i < n; i++) text += buffer[i].text;
      return text;
    }
  },
  
  emitFormat: function(escapeCode) {
    if (JS.Console.WINDOZE) return;
    
    var text     = JS.Console.escape(escapeCode + 'm'),
        buffer   = JS.Console.__buffer__,
        wasEmpty = (JS.Console.bufferSize() === 0);
    
    if (typeof process === 'object') return require('sys').print(text);
    JS.Console.__buffer__.push({text: text, length: 0});
    
    if (wasEmpty) return;
    
    this.writeToStdout(JS.Console.PREVIOUS_LINE + JS.Console.bufferText());
  },
  
  puts: function(string) {
    var bufferText = JS.Console.bufferText();
    
    if (JS.Console.bufferSize() === 0) string = bufferText + string;
    if (JS.Console.WINDOZE && bufferText !== '')
      this.writeToStdout(bufferText);
    
    JS.Console.__buffer__ = [];
    if (JS.Console._printing && typeof process === 'object')
      this.writeToStdout('');
    
    JS.Console._printing = false;
    this.writeToStdout(string);
  },
  
  print: function(string) {
    JS.Console._printing = true;
    if (typeof process === 'object') return require('sys').print(string);
    
    var buffer   = JS.Console.__buffer__,
        wasEmpty = (JS.Console.bufferSize() === 0),
        max      = JS.Console.MAX_BUFFER_LENGTH;
        escape;
    
    buffer.push({text: string, length: string.length});
    
    while (JS.Console.bufferSize() > max) {
      escape = (!wasEmpty && !JS.Console.WINDOZE) ? JS.Console.PREVIOUS_LINE : '';
      this.writeToStdout(escape + JS.Console.bufferChunk(max));
      wasEmpty = true;
    }
    
    if (JS.Console.WINDOZE) return;
    
    var escape = wasEmpty ? '' : JS.Console.PREVIOUS_LINE;
    this.writeToStdout(escape + JS.Console.bufferText());
  },
  
  writeToStdout: function(string) {
    if (typeof process === 'object')    return require('sys').puts(string);
    if (typeof WScript !== 'undefined') return WScript.Echo(string);
    if (typeof print === 'function')    return print(string);
  }
});

JS.Console.extend({
  PREVIOUS_LINE: JS.Console.escape('F') + JS.Console.escape('K')
});

(function() {
  for (var key in JS.Console.ESCAPE_CODES) (function(key) {
    JS.Console.define(key, function() {
      if (JS.Console.WINDOZE) return;
      var escape = JS.Console.ESCAPE_CODES[key];
      
      if (escape.color)      JS.Console.__format__.color      = escape.code;
      if (escape.decoration) JS.Console.__format__.decoration = escape.code;
      if (escape.weight)     JS.Console.__format__.weight     = escape.code;
      
      this.emitFormat(escape.code);
    });
  })(key);
})();

JS.Console.extend(JS.Console);
