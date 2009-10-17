JS.Test.Unit.extend({
  UI: new JS.Module({
    extend: {
      SILENT:         1,
      PROGRESS_ONLY:  2,
      NORMAL:         3,
      VERBOSE:        4,
      
      /** section: test
       * mixin JS.Test.Unit.UI.TestRunnerUtilities
       * 
       * Provides some utilities common to most, if not all,
       * TestRunners.
       **/
      TestRunnerUtilities: new JS.Module({
        /**
         * JS.Test.Unit.UI.TestRunnerUtilities#run(suite, outputLevel) -> JS.Test.Unit.TestResult
         * 
         * Creates a new TestRunner and runs the suite.
         **/
        run: function(suite, outputLevel) {
          return new this(suite, outputLevel ||JS.Test.Unit.UI.NORMAL).start();
        },
        
        /**
         * JS.Test.Unit.UI.TestRunnerUtilities#startCommandLineTest() -> undefined
         * 
         * Takes care of the ARGV parsing and suite
         * determination necessary for running one of the
         * TestRunners from the command line.
         **/
        startCommandLineTest: function() {
        /*
          if ARGV.empty?
            puts "You should supply the name of a test suite file to the runner"
            exit
          end
          require ARGV[0].gsub(/.+::/, '')
          new(eval(ARGV[0])).start
        */
        }
      })
    }
  })
});

