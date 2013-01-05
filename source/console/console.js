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

    convert: function(object, stack) {
      if (object === null || object === undefined) return String(object);
      var E = JS.Enumerable, stack = stack || [], items;

      if (JS.indexOf(stack, object) >= 0) return '#circular';

      if (object instanceof Error) {
        return (typeof object.message === 'string' && !object.message)
             ? object.name
             : object.name + (object.message ? ': ' + object.message : '');
      }

      if (object instanceof Array) {
        stack.push(object);
        items = new E.Collection(object).map(function(item) {
            return this.convert(item, stack);
          }, this).join(', ');
        stack.pop();
        return items ? '[ ' + items + ' ]' : '[]';
      }

      if (object instanceof String || typeof object === 'string')
        return '"' + object + '"';

      if (object instanceof Function)
        return object.displayName ||
               object.name ||
              (object.toString().match(/^\s*function ([^\(]+)\(/) || [])[1] ||
               '#function';

      if (object instanceof Date)
        return object.toGMTString();

      if (object.toString &&
          object.toString !== Object.prototype.toString &&
          !object.toString.__traced__)
        return object.toString();

      if (object.nodeType !== undefined) return object.toString();

      stack.push(object);
      items = new E.Collection(E.objectKeys(object, false).sort()).map(function(key) {
          return this.convert(key, stack) + ': ' + this.convert(object[key], stack);
        }, this).join(', ');
      stack.pop();
      return items ? '{ ' + items + ' }' : '{}';
    },

    filterBacktrace: function(stack) {
      if (!stack) return stack;
      stack = stack.split('\n').slice(1).join('\n');
      var filter = this.adapter.backtraceFilter();

      return filter
           ? stack.replace(filter, '')
           : stack;
    },

    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,
    MAX_DEPTH: 4,

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

    envvar: function(name) {
      return this.adapter.envvar(name);
    },

    escape: function(string) {
      return this.ANSI_CSI + string;
    },

    exit: function(status) {
      this.adapter.exit(status);
    }
  },

  consoleFormat: function() {
    this.reset();
    var i = arguments.length;
    while (i--) this[arguments[i]]();
  },

  print: function(string) {
    string = (string === undefined ? '' : string).toString();
    JS.Console.adapter.print(string);
  },

  puts: function(string) {
    string = (string === undefined ? '' : string).toString();
    JS.Console.adapter.puts(string);
  }
});

