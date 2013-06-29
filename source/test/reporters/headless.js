// http://phantomjs.org/
// http://slimerjs.org/

Test.Reporters.extend({
  Headless: new JS.Class({
    extend: {
      UA: /\b(PhantomJS|SlimerJS)\b/
    },

    initialize: function(options) {
      this._options = options || {};

      var format = Console.envvar('FORMAT');

      if (Console.envvar('TAP')) format = format || 'tap';
      this._options.format = this._options.format || format;

      var R        = Test.Reporters,
          Printer  = R.get(this._options.format) || R.Dot,
          reporter = new R.Composite();

      reporter.addReporter(new Printer(options));
      reporter.addReporter(new R.ExitStatus());

      this._reader = new R.JSON.Reader(reporter);
    },

    open: function(url) {
      var page = (typeof WebPage === 'function') ? new WebPage() : require('webpage').create(),
          self = this;

      page.onConsoleMessage = function(message) {
        if (!self._reader.read(message)) console.log(message);
      };
      page.open(url);
      return page;
    }
  })
});

