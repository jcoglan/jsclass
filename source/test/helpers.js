JS.Test.extend({
  Helpers: new JS.Module({
    $R: function(start, end) {
      return new JS.Range(start, end);
    },

    $w: function(string) {
      return string.split(/\s+/);
    },

    forEach: function(list, block, context) {
      for (var i = 0, n = list.length; i < n; i++) {
        block.call(context || null, list[i], i);
      }
    },

    its: function() {
      return new JS.MethodChain();
    },

    map: function(list, block, context) {
      return new JS.Enumerable.Collection(list).map(block, context)
    },

    repeat: function(n, block, context) {
      while (n--) block.call(context);
    }
  })
});

