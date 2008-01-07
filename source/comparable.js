JS.Comparable = JS.Module({
  extend: {
    compare: function(one, another) {
      return one.compareWith(another);
    }
  },
  lt: function(other) {
    return this.compareWith(other) == -1;
  },
  lte: function(other) {
    return this.compareWith(other) < 1;
  },
  gt: function(other) {
    return this.compareWith(other) == 1;
  },
  gte: function(other) {
    return this.compareWith(other) > -1;
  },
  eq: function(other) {
    return this.compareWith(other) == 0;
  },
  between: function(a, b) {
    return this.gte(a) && this.lte(b);
  }
});
