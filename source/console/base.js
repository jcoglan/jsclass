Console.extend({
  Base: new JS.Class({
    __buffer__: '',
    __format__: '',

    backtraceFilter: function() {
      if (typeof version === 'function' && version() > 100) {
        return /.*/;
      } else {
        return null;
      }
    },

    coloring: function() {
      return true;
    },
    
    echo: function(string) {
      if (typeof console !== 'undefined') return console.log(string);
      if (typeof print === 'function')    return print(string);
    },

    envvar: function(name) {
      return null;
    },

    exit: function(status) {
      if (typeof system === 'object' && system.exit) system.exit(status);
      if (typeof quit === 'function')                quit(status);
    },

    format: function(name, args) {
      if (!this.coloring()) return;
      var escape = Console.ESCAPE_CODES[name];

      for (var i = 0, n = args.length; i < n; i++)
        escape = escape.replace('%' + (i+1), args[i]);

      this.__format__ += Console.escape(escape);
    },

    flushFormat: function() {
      var format = this.__format__;
      this.__format__ = '';
      return format;
    },

    getDimensions: function() {
      var width  = this.envvar('COLUMNS') || Console.DEFAULT_WIDTH,
          height = this.envvar('ROWS')    || Console.DEFAULT_HEIGHT;

      return [parseInt(width, 10), parseInt(height, 10)];
    },

    print: function(string) {
      var coloring = this.coloring(),
          width    = this.getDimensions()[0],
          esc      = Console.escape,
          length, prefix, line;

      while (string.length > 0) {
        length = this.__buffer__.length;
        prefix = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : '';
        line   = string.substr(0, width - length);

        this.__buffer__ += line;

        if (coloring) this.echo(prefix + this.flushFormat() + line);

        if (this.__buffer__.length === width) {
          if (!coloring) this.echo(this.__buffer__);
          this.__buffer__ = '';
        }
        string = string.substr(width - length);
      }
    },

    puts: function(string) {
      var coloring = this.coloring(),
          esc      = Console.escape,
          length   = this.__buffer__.length,
          prefix   = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : this.__buffer__;

      this.echo(prefix + this.flushFormat() + string);
      this.__buffer__ = '';
    }
  })
});

