JS.Console.extend({
  Node: new JS.Class(JS.Console.Base, {
    backtraceFilter: function() {
      return new RegExp(process.cwd() + '/', 'g');
    },

    coloring: function() {
      return require('tty').isatty(1);
    },

    exit: function(status) {
      process.exit(status);
    },

    print: function(string) {
      process.stdout.write(this.flushFormat() + string);
    },

    puts: function(string) {
      process.stdout.write(this.flushFormat() + string + '\n');
    }
  })
});

