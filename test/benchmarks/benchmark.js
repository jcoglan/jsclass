Benchmark = {
  N: 5,
  
  measure: function(name, runs, functions) {
    var envs  = [], env,
        times = [],
        block = functions.test;
    
    var i = runs * this.N;
    while (i--) {
      env = {};
      if (functions.setup) functions.setup.call(env);
      envs.push(env);
    }
    
    var n = this.N, start, end;
    while (n--) {
      i = runs;
      start = new Date().getTime();
      while (i--) block.call(envs.pop());
      end = new Date().getTime();
      times.push(end - start);
    }
    
    var average = this.average(times);
    print(name + ' :: ' + this.format(average));
  },
  
  format: function(average) {
    var error = (average.value === 0) ? 0 : 100 * average.error / average.value;
    return Math.round(average.value) +
           ' +/- ' + Math.round(error) + '%';
  },
  
  average: function(list) {
    return { value: this.mean(list), error: this.stddev(list) };
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
    var square = function(x) { return x*x };
    return Math.sqrt(this.mean(list, square) - square(this.mean(list)));
  }
};

