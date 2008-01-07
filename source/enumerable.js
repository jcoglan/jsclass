JS.Enumerable = JS.Module({
  each: function(block, context) {
    for (var i = 0, n = this.length; i < n; i++)
      block.call(context || null, this[i], i);
  },
  
  inject: function(memo, block, context) {
    if (typeof memo == 'function') {
      context = block; block = memo; memo = undefined;
    }
    this.each(function(item, i) {
      if (i == 0 && memo === undefined) return memo = item;
      memo = block.call(context || null, memo, item, i);
    });
    return memo;
  },
  
  all: function(block, context) {
    return this.inject(true, function(memo, item, i) {
      return memo && block.call(context || null, item, i);
    });
  },
  
  any: function(block, context) {
    return this.inject(false, function(memo, item, i) {
      return memo || block.call(context || null, item, i);
    });
  }
});
