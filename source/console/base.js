JS.Console.extend({
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

    exit: function(status) {
      if (typeof phantom === 'object')               phantom.exit(status);
      if (typeof system === 'object' && system.exit) system.exit(status);
      if (typeof quit === 'function')                quit(status);
    },

    format: function(name) {
      if (!this.coloring()) return;
      var escape = JS.Console.ESCAPE_CODES[name];
      this.__format__ += JS.Console.escape(escape + 'm');
    },

    flushFormat: function() {
      var format = this.__format__;
      this.__format__ = '';
      return format;
    },

    maxBufferLength: function() {
      return JS.Console.MAX_BUFFER_LENGTH;
    },

    output: function(string, followon) {
      var coloring = this.coloring();

      while (string.length > 0) {
        var length  = this.__buffer__.length,
            max     = this.maxBufferLength(),
            movable = (length > 0 && coloring),
            escape  = movable ? JS.Console.escape('1F') + JS.Console.escape((length + 1) + 'G') : '',
            line    = string.substr(0, max - length);

        this.__buffer__ += line;

        if (coloring)
          this.println(escape + this.flushFormat() + line);
        else if (this.__buffer__.length === max)
          this.println(this.__buffer__);

        if (this.__buffer__.length === max)
          this.__buffer__ = '';

        string = string.substr(max - length);
      }
      if (!followon) {
        if (string === '' && !this.__buffer__)
          this.println(this.flushFormat() + '');

        if (!coloring && this.__buffer__)
          this.println(this.__buffer__);

        this.__buffer__ = '';
      }
    },

    println: function(string) {
      if (typeof console !== 'undefined') return console.log(string);
      if (typeof print === 'function')    return print(string);
    },

    print: function(string) {
      this.output(string, true);
    },

    puts: function(string) {
      this.output(string, false);
    }
  })
});

