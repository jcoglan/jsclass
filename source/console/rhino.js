Console.extend({
  Rhino: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(java.lang.System.getProperty('user.dir') + '/', 'g');
    },

    print: function(string) {
      java.lang.System.out.print(this.flushFormat() + string);
    },

    puts: function(string) {
      java.lang.System.out.println(this.flushFormat() + string);
    }
  })
});

