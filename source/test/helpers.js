JS.Test.extend({
  Helpers: new JS.Module({
    $w: function(string) {
      return string.split(/\s+/);
    },
    
    forEach: function(list, block, context) {
      for (var i = 0, n = list.length; i < n; i++) {
        block.call(context || null, list[i], i);
      }
    }
  })
});

