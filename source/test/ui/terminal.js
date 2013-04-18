Test.UI.extend({
  Terminal: new JS.Class({
    OPTIONS: {format: String, test: Array},
    SHORTS:  {'f': '--format', 't': '--test'},

    getOptions: function() {
      var options = {},
          format  = Console.envvar('FORMAT'),
          test    = Console.envvar('TEST'),
          nopt;

      if (Console.envvar('TAP')) options.format = 'tap';

      if (format) options.format = format;
      if (test)   options.test   = [test];

      if (Console.NODE) {
        try { nopt = require('nopt') } catch (e) {}
        if (nopt) JS.extend(options, nopt(this.OPTIONS, this.SHORTS));
      }

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

