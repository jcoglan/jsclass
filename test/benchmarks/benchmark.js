Benchmark = {
  N: 5,
  
  measure: function(name, runs, functions) {
    var times = {setup: [], test: []};
    
    this.collectTimes(runs, times.setup, function() {
      var context = {};
      if (functions.setup) functions.setup.call(context);
    });
    
    this.collectTimes(runs, times.test, function() {
      var context = {};
      if (functions.setup) functions.setup.call(context);
      functions.test.call(context);
    });
    
    var setup = this.average(times.setup),
        test  = this.average(times.test),
        total = this.difference(test, setup);
    
    print(this.format(total));
  },
  
  collectTimes: function(runs, results, block) {
    var n = this.N, start, end, i;
    while (n--) {
      i = runs;
      start = new Date().getTime();
      while (i--) block.call();
      end = new Date().getTime();
      results.push(end - start);
    }
  },
  
  average: function(list) {
    return { value: this.mean(list), error: this.stddev(list) };
  },
  
  difference: function(a, b) {
    return {
      value: a.value - b.value,
      error: Math.sqrt(Math.pow(a.error, 2) + Math.pow(b.error, 2))
    };
  },
  
  format: function(average) {
    var error = (average.value === 0) ? 0 : 100 * average.error / average.value;
    return Math.round(average.value) +
           ' +/- ' + Math.round(error) + '%';
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

