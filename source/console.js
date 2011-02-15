JS.Console = new JS.Module('Console', {
  extend: {
    nameOf: function(object, root) {
      var results = [], i, n, field, l;
      
      if (JS.isType(object, Array)) {
        for (i = 0, n = object.length; i < n; i++)
          results.push(this.nameOf(object[i]));
        return results;
      }
      
      if (object.displayName) return object.displayName;
      
      field = [{name: null, o: root || JS.ENV}];
      l = 0;
      while (typeof field === 'object' && l < this.MAX_DEPTH) {
        l += 1;
        field = this.descend(field, object);
      }
      if (typeof field == 'string') {
        field = field.replace(/\.prototype\./g, '#');
        object.displayName = field;
        if (object.__meta__) object.__meta__.displayName = field + '.__meta__';
      }
      return object.displayName;
    },
    
    descend: function(list, needle) {
      var results = [],
          n       = list.length,
          i       = n,
          key, item, name;
      
      while (i--) {
        item = list[i];
        if (JS.isType(item.o, Array)) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },
    
    MAX_DEPTH: 4,
    
    convert: function(object, stringify) {
      var E = JS.Enumerable;
      if (!object) return String(object);
      
      if (object instanceof Error)
        return object.name + (object.message ? ': ' + object.message : '');
      
      if (object instanceof Array)
      return '[' + new E.Collection(object).map(function(item) {
          return this.convert(item);
        }, this).join(',') + ']';
      
      if (object instanceof String || typeof object === 'string')
        return '"' + object + '"';
      
      if (object instanceof Function)
        return object.displayName ||
               object.name ||
              (object.toString().match(/^\s*function ([^\(]+)\(/) || [])[1] ||
               '#function';
      
      if (object.toString &&
          object.toString !== Object.prototype.toString &&
          !object.toString.__traced__)
        return object.toString();
      
      return '{' + new E.Collection(E.objectKeys(object, false).sort()).map(function(key) {
          return this.convert(key) + ':' + this.convert(object[key]);
        }, this).join(',') + '}';
    },
    
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    
    BROWSER: (typeof window !== 'undefined'),
    NODE:    (typeof process === 'object'),
    WINDOZE: (typeof window !== 'undefined' || typeof WScript !== 'undefined'),
    
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
        string = this.__buffer__ + string;
      
      string = (string && string.toString() || '');
      if (string === '' && !followon) this.writeToStdout(this.flushFormat() + '');
      
      while (string.length > 0) {
        var length  = this.__buffer__.length,
            max     = this.BROWSER ? 1000 : this.MAX_BUFFER_LENGTH,
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
      if (typeof console !== 'undefined') return console.log(string);
      if (typeof alert === 'function')    return alert(string);
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    }
  },
  
  consoleFormat: function() {
    this.reset();
    var i = arguments.length;
    while (i--) this[arguments[i]]();
  },
  
  puts: function(string) {
    var C = JS.Console;
    if (!C.NODE) return C.output(string, false);
    require('sys').puts(C.flushFormat() + string);
    C.__print__ = false;
  },
  
  print: function(string) {
    var C = JS.Console;
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
