Console.extend({
  Node: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(process.cwd() + '/', 'g');
    },

    coloring: function() {
      return require('tty').isatty(1);
    },

    envvar: function(name) {
      return process.env[name] || null;
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

