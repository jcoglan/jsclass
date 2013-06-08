// https://github.com/jquery/testswarm

Test.Reporters.extend({
  TestSwarm: new JS.Class({
    extend: {
      create: function(options, browser) {
        if (JS.ENV.TestSwarm) return new this(options, browser);
      }
    },

    initialize: function(options, browserReporter) {
      this._browserReporter = browserReporter;

      TestSwarm.serialize = function() {
        return browserReporter.serialize();
      };
    },

    startSuite: function(event) {},

    startContext: function(event) {},

    startTest: function(event) {},

    addFault: function(event) {},

    endTest: function(event) {
      TestSwarm.heartbeat();
    },

    endContext: function(event) {},

    update: function(event) {},

    endSuite: function(event) {
      TestSwarm.submit({
        fail:   event.failures,
        error:  event.errors,
        total:  event.tests
      });
    }
  })
});

Test.Reporters.register('testswarm', Test.Reporters.TestSwarm);

