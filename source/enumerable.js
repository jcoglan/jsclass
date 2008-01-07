JS.Enumerable = (function() {
  
  var Null = function(context) { return context || null; };
  
  var each = function(block, context) {
    for (var i = 0, n = this.length; i < n; i++)
      block.call(Null(context), this[i], i);
  };
  
  var methods = {
    inject: function(memo, block, context) {
      if (typeof memo == 'function') {
        context = block; block = memo; memo = undefined;
      }
      var counter = 0;
      this.each(function(item, i) {
        if (!counter++ && memo === undefined) return memo = item;
        memo = block.call(Null(context), memo, item, i);
      });
      return memo;
    },
    
    all: function(block, context) {
      return this.inject(true, function(memo, item, i) {
        return memo && block.call(Null(context), item, i);
      });
    },
    
    any: function(block, context) {
      return this.inject(false, function(memo, item, i) {
        return memo || block.call(Null(context), item, i);
      });
    },
    
    map: function(block, context) {
      return this.inject([], function(memo, item, i) {
        memo.push(block.call(Null(context), item, i));
        return memo;
      });
    }
  };
  
  var alias = {map: 'collect'};
  for (var key in alias) methods[alias[key]] = methods[key];
  
  return {
    included: function(klass) {
      if (!klass.prototype.each) klass.include({each: each});
      klass.include(methods);
    }
  };
})();
