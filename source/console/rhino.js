Console.extend({
  Rhino: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(java.lang.System.getProperty('user.dir') + '/', 'g');
    },

    coloring: function() {
      return !this.envvar(Console.NO_COLOR);
    },

    envvar: function(name) {
      var env = java.lang.System.getenv();
      return env.get(name) || null;
    },

    getDimensions: function() {
      var proc = java.lang.Runtime.getRuntime().exec(['sh', '-c', 'stty -a < /dev/tty']),
          is   = proc.getInputStream(),
          bite = 0,
          out  = '',
          width, height;

      while (bite >= 0) {
        bite = is.read();
        if (bite >= 0) out += String.fromCharCode(bite);
      }

      var match = out.match(/rows\s+(\d+);\s+columns\s+(\d+)/);
      if (!match) return this._dimCache || this.callSuper();

      return this._dimCache = [parseInt(match[2], 10), parseInt(match[1], 10)];
    },

    print: function(string) {
      java.lang.System.out.print(this.flushFormat() + string);
    },

    puts: function(string) {
      java.lang.System.out.println(this.flushFormat() + string);
    }
  })
});

