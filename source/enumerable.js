JS.Enumerable = (function() {
  
  var Null = function(context) { return context || null; };
  
  var each = function(block, context) {
    for (var i = 0, n = this.length; i < n; i++)
      block.call(Null(context), this[i], i);
  };
  
  var methods = {
    inject: function(memo, block, context) {
      var counter = 0, K = {};
      if (typeof memo == 'function') {
        context = block; block = memo; memo = K;
      }
      this.each(function(item, i) {
        if (!counter++ && memo === K) return memo = item;
        memo = block.call(Null(context), memo, item, i);
      });
      return memo;
    },
    
    all: function(block, context) {
      return !!this.inject(true, function(memo, item, i) {
        return memo && block.call(Null(context), item, i);
      });
    },
    
    any: function(block, context) {
      return !!this.inject(false, function(memo, item, i) {
        return memo || block.call(Null(context), item, i);
      });
    },
    
    eachCons: function(n, block, context) {
      var size = this.entries().length, limit = size - n, counter = 0, i, len, set;
      var sets = this.inject([], function(memo, item) {
        if (counter <= limit) memo[counter] = [];
        for (i = 1, len = Math.min(++counter, n); i <= len; i++) {
          set = memo[counter - i];
          if (set) set.push(item);
        }
        return memo;
      });
      each.call(sets, block, context);
    },
    
    eachSlice: function(n, block, context) {
      var size = this.entries().length, p = Math.ceil(size/n), sets = new Array(p), counter = 0;
      each.call(sets, function(x,i) { sets[i] = []; });
      sets = this.inject(sets, function(memo, item) {
        memo[Math.floor(counter++ / n)].push(item);
        return memo;
      });
      each.call(sets, block, context);
    },
    
    find: function(block, context) {
      var K = {};
      return this.inject(K, function(memo, item, i) {
        return (memo === K)
            ? (block.call(Null(context), item, i) ? item : memo)
            : memo;
      });
    },
    
    map: function(block, context) {
      return this.inject([], function(memo, item, i) {
        memo.push(block.call(Null(context), item, i));
        return memo;
      });
    },
    
    toArray: function() {
      return this.map(function(x) { return x; });
    }
  };
  
  var alias = {
    find:       'detect',
    map:        'collect',
    toArray:    'entries'
  };
  
  for (var key in alias) methods[alias[key]] = methods[key];
  
  return {
    included: function(klass) {
      if (!klass.prototype.each) klass.include({each: each});
      klass.include(methods);
    }
  };
})();
