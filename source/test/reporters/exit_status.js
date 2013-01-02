JS.Test.Reporters.extend({
  ExitStatus: new JS.Class({
    startSuite: function(event) {},

    startContext: function(event) {},

    startTest: function(event) {},

    addFault: function(event) {},

    endTest: function(event) {},

    endContext: function(event) {},

    update: function(event) {},

    endSuite: function(event) {
      JS.Console.exit(event.passed ? 0 : 1);
    }
  })
});

