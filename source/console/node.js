Console.extend({
  Node: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(process.cwd() + '/', 'g');
    },

    coloring: function() {
      return !process.env[Console.NO_COLOR] && require('tty').isatty(1);
    },

    envvar: function(name) {
      return process.env[name] || null;
    },

    exit: function(status) {
      process.exit(status);
    },

    getDimensions: function() {
      var width, height, dims;
      if (process.stdout.getWindowSize) {
        dims   = process.stdout.getWindowSize();
        width  = dims[0];
        height = dims[1];
      } else {
        dims   = process.binding('stdio').getWindowSize();
        width  = dims[1];
        height = dims[0];
      }
      return [width, height];
    },

    print: function(string) {
      require('sys').print(this.flushFormat() + string);
    },

    puts: function(string) {
      require('sys').puts(this.flushFormat() + string);
    }
  })
});

