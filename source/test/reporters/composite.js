Test.Reporters.extend({
  Composite: new JS.Class({
    initialize: function(reporters) {
      this._reporters = reporters || [];
    },

    addReporter: function(reporter) {
      if (!reporter) return;
      this._reporters.push(reporter);
    },

    removeReporter: function(reporter) {
      var index = JS.indexOf(this._reporters, reporter);
      if (index >= 0) this._reporters.splice(index, 1);
    }
  })
});

(function() {
  var methods = Test.Reporters.METHODS,
      n       = methods.length;

  while (n--)
    (function(i) {
      var method = methods[i];
      Test.Reporters.Composite.define(method, function(event) {
        var fn;
        for (var i = 0, n = this._reporters.length; i < n; i++) {
          fn = this._reporters[i][method];
          if (fn) fn.call(this._reporters[i], event);
        }
      });
    })(n);
})();

