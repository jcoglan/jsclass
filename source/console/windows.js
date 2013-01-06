Console.extend({
  Windows: new JS.Class(Console.Base, {
    coloring: function() {
      return false;
    },

    exit: function(status) {
      WScript.Quit(status);
    },

    println: function(string) {
      WScript.Echo(string);
    }
  })
});

