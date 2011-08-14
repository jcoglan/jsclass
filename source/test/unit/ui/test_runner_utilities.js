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
        },
        
        getFilter: function() {
          if (JS.ENV.location && /\btest=/.test(location.search)) {
            var filter = [],
                terms  = location.search.match(/\btest=([^&]+)/)[1].split(','),
                n      = terms.length;
            
            while (n--) filter.push(decodeURIComponent(terms[n]));
            return filter;
          }
          else if (typeof process === 'object') {
            return process.argv.slice(2);
          }
          else return [];
        }
      })
    }
  })
});

