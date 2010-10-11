Benchmark = {
  N: 5,
  
  measure: function(name, runs, functions) {
    var times = {setup: [], test: []};
    this.collectTimes(runs, functions.test, times.test);
    print(this.format(times.test));
  },
  
  collectTimes: function(runs, block, results) {
    var n = this.N, start, end, i;
    while (n--) {
      i = runs;
      start = new Date().getTime();
      while (i--) block.call();
      end = new Date().getTime();
      results.push(end - start);
    }
  },
  
  format: function(timings) {
    var mean    = this.mean(timings),
        stddev  = this.stddev(timings),
        error   = 100 * stddev / mean;
    
    return Math.round(mean) + ' +/- ' + Math.round(error) + '%';
  },
  
  mean: function(list, mapper) {
    var values = [],
        mapper = mapper || function(x) { return x },
        n      = list.length,
        sum    = 0;
    
    while (n--) values.push(mapper(list[n]));
    
    n = values.length;
    while (n--) sum += values[n];
    return sum / values.length;
  },
  
  stddev: function(list) {
    return Math.sqrt(this.mean(list, function(x) { return x*x }) -
                     Math.pow(this.mean(list), 2));
  }
};

