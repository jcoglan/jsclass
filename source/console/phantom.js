Console.extend({
  Phantom: new JS.Class(Console.Base, {
    echo: function(string) {
      console.log(string);
    },

    envvar: function(name) {
      return require('system').env[name] || null;
    },

    exit: function(status) {
      phantom.exit(status);
    }
  })
});

