JS.Test.Reporters.extend({
  ExitStatus: new JS.Class({
    startRun: function(event) {},

    startSuite: function(event) {},

    startTest: function(event) {},

    addFault: function(event) {},

    endTest: function(event) {},

    endSuite: function(event) {},

    update: function(event) {},

    endRun: function(event) {
      JS.Console.exit(event.passed ? 0 : 1);
    }
  })
});

