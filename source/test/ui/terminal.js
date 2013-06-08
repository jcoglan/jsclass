Test.UI.extend({
  Terminal: new JS.Class({
    getOptions: function() {
      var options = {},
          format  = Console.envvar('FORMAT'),
          test    = Console.envvar('TEST');

      if (Console.envvar('TAP')) options.format = 'tap';

      if (format) options.format = format;
      if (test)   options.test   = [test];

      delete options.argv;
      options.test = options.test || [];
      return options;
    },

    getReporters: function(options) {
      var R = Test.Reporters,
          Printer = R.get(options.format) || R.Dot;

      return [
        new R.Coverage(options),
        new Printer(options),
        new R.ExitStatus(options)
      ];
    }
  })
});

