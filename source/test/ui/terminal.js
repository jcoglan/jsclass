Test.UI.extend({
  Terminal: new JS.Class({
    OPTIONS: {format: String, test: Array},
    SHORTS:  {'f': '--format', 't': '--test'},

    prepare: function(callback, context) {
      callback.call(context || null, this);
    },

    getOptions: function() {
      var options = {},
          format  = Console.envvar('FORMAT'),
          test    = Console.envvar('TEST');

      if (Console.envvar('TAP')) options.format = 'tap';

      if (format) options.format = format;
      if (test)   options.test   = [test];

      if (Console.NODE)
        JS.extend(options, require('nopt')(this.OPTIONS, this.SHORTS));

      delete options.argv;
      options.test = options.test || [];
      return options;
    },

    getReporters: function(options) {
      var reporters = [],
          R = Test.Reporters;

      var Printer = R.get(options.format) || R.Dot;
      reporters.push(new Printer(options));
      reporters.push(new R.ExitStatus(options));

      return reporters;
    }
  })
});

