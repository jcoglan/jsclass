Test.UI.extend({
  Terminal: new JS.Class({
    OPTIONS: {format: String, test: Array},
    SHORTS:  {'f': '--format', 't': '--test'},

    prepare: function(callback, context) {
      callback.call(context || null, this);
    },

    getOptions: function() {
      var options = {}, env, test, format;

      if (Console.NODE) {
        if (process.env.TAP) options.format = 'tap';
        format = process.env.FORMAT;
        test   = process.env.TEST;
      }

      if (Console.RHINO) {
        env = java.lang.System.getenv();
        if (env.get('TAP')) options.format = 'tap';
        format = env.get('FORMAT');
        test   = env.get('TEST');
      }

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

      var Printer = R.find(options.format) || R.Dot;
      reporters.push(new Printer(options));
      reporters.push(new R.ExitStatus(options));

      return reporters;
    }
  })
});

