Test.extend({
  Runner: new JS.Class({
    initialize: function(settings) {
      this._settings = (typeof settings === 'string')
                     ? {format: settings}
                     : (settings || {});

      this._ui = this.klass.getUI(this._settings);
    },

    run: function(callback, context) {
      this.prepare(function() {
        this.start(callback, context);
      }, this);
    },

    prepare: function(callback, context) {
      var R    = Test.Reporters._registry,
          n    = 0,
          done = false;

      for (var name in R) {
        if (!R[name] || !R[name].prepare) continue;
        n += 1;
        R[name].prepare(function() {
          n -= 1;
          if (n === 0 && done) callback.call(context);
        });
      }
      done = true;
      if (n === 0) callback.call(context);
    },

    start: function(callback, context) {
      var options   = this.getOptions(),
          reporters = this._ui.getReporters(options),
          suite     = this.getSuite(options);

      this.setReporter(new Test.Reporters.Composite(reporters));
      if (callback) callback.call(context, this);

      var testResult = new Test.Unit.TestResult(),
          TR         = Test.Unit.TestResult,
          TS         = Test.Unit.TestSuite,
          TC         = Test.Unit.TestCase;

      var resultListener = testResult.addListener(TR.CHANGED, function() {
        var result = testResult.metadata();
        this._reporter.update(this.klass.timestamp(result));
      }, this);

      var faultListener = testResult.addListener(TR.FAULT, function(fault) {
        this._reporter.addFault(this.klass.timestamp(fault.metadata()));
      }, this);

      var reportResult = function() {
        testResult.removeListener(TR.CHANGED, resultListener);
        testResult.removeListener(TR.FAULT, faultListener);

        var result = testResult.metadata();
        this._reporter.endSuite(this.klass.timestamp(result));
      };

      var reportEvent = function(channel, testCase) {
        var event = this.klass.timestamp(testCase.metadata());
        if (channel === TS.STARTED)       this._reporter.startContext(event);
        else if (channel === TC.STARTED)  this._reporter.startTest(event);
        else if (channel === TC.FINISHED) this._reporter.endTest(event);
        else if (channel === TS.FINISHED) this._reporter.endContext(event);
      };

      this.klass.reportEventId = 0;
      this._reporter.startSuite(this.klass.timestamp(suite.metadata(true)));

      suite.run(testResult, reportResult, reportEvent, this);
    },

    addReporter: function(reporter) {
      var current = this._reporter;
      if (!(current instanceof Test.Reporters.Composite)) {
        this._reporter = new Test.Reporters.Composite();
        this._reporter.addReporter(current);
      }
      this._reporter.addReporter(reporter);
    },

    setReporter: function(reporter) {
      this._reporter = reporter;
    },

    getOptions: function() {
      return JS.extend(this._ui.getOptions(), this._settings);
    },

    getSuite: function(options) {
      var filter = options.test;
      Test.Unit.TestCase.resolve();
      var suite = Test.Unit.TestCase.suite(filter);
      Test.Unit.TestCase.clear();
      return suite;
    },

    extend: {
      timestamp: function(event) {
        event.eventId = this.reportEventId++;
        event.timestamp = new JS.Date().getTime();
        return event;
      },

      getUI: function(settings) {
        if (Console.BROWSER && !Console.PHANTOM)
          return new Test.UI.Browser(settings);
        else
          return new Test.UI.Terminal(settings);
      },

      filter: function(objects, suffix) {
        var filter = this.getUI().getOptions().test,
            n      = filter.length,
            output = [],
            m, object;

        if (n === 0) return objects;

        while (n--) {
          m = objects.length;
          while (m--) {
            object = objects[m].replace(new RegExp(suffix + '$'), '');
            if (filter[n].substr(0, object.length) === object)
              output.push(objects[m]);
          }
        }
        return output;
      }
    }
  }),

  autorun: function(options, callback, context) {
    if (typeof options === 'function') {
      context  = callback;
      callback = options;
      options  = {};
    }
    if (typeof callback !== 'function') {
      callback = undefined;
      context  = undefined;
    }
    var runner = new Test.Runner(options);
    runner.run(callback, context);
  }
});

