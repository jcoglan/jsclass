// http://phantomjs.org/

Test.Reporters.extend({
  PhantomJS: new JS.Class({
    initialize: function(options, page) {
      this._options = options || {};

      var format = Console.envvar('FORMAT');

      if (Console.envvar('TAP')) format = format || 'tap';
      this._options.format = this._options.format || format;

      var R        = Test.Reporters,
          Printer  = R.get(this._options.format) || R.Dot,
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

