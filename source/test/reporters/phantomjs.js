JS.Test.Reporters.extend({
  PhantomJS: new JS.Class({
    initialize: function(options, page) {
      this._options = options || {};

      var env    = require('system').env,
          format = env.FORMAT;

      if (env.TAP) format = format || 'tap';
      this._options.format = this._options.format || format;

      var R        = JS.Test.Reporters,
          Printer  = R.find(this._options.format) || R.Dot,
          reporter = new R.Composite(),
          bridge   = new R.JSON.Reader(reporter);

      reporter.addReporter(new Printer(options));
      reporter.addReporter(new R.ExitStatus());

      page.onConsoleMessage = function(m) {
        if (!bridge.read(m)) console.log(m);
      };
    }
  })
});

