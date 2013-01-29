Console.extend({
  Windows: new JS.Class(Console.Base, {
    coloring: function() {
      return false;
    },

    echo: function(string) {
      WScript.Echo(string);
    },

    exit: function(status) {
      WScript.Quit(status);
    }
  })
});

