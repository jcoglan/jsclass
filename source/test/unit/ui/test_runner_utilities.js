JS.Test.Unit.extend({
  UI: new JS.Module({
    extend: {
      SILENT:         1,
      PROGRESS_ONLY:  2,
      NORMAL:         3,
      VERBOSE:        4,
      
      TestRunnerUtilities: new JS.Module({
        run: function(suite, outputLevel) {
          return new this(suite, outputLevel ||JS.Test.Unit.UI.NORMAL).start();
        }
      })
    }
  })
});

