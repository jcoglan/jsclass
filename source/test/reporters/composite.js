Test.Reporters.extend({
  Composite: new JS.Class({
    initialize: function(reporters) {
      this._reporters = reporters || [];
      this._queue     = [];
      this._pointer   = 0;
    },

    addReporter: function(reporter) {
      if (!reporter) return;
      this._reporters.push(reporter);
    },

    removeReporter: function(reporter) {
      var index = JS.indexOf(this._reporters, reporter);
      if (index >= 0) this._reporters.splice(index, 1);
    },

    flush: function() {
      var queue = this._queue, method, event, i, n, fn;
      while (queue[this._pointer] !== undefined) {
        method = queue[this._pointer][0];
        event =  queue[this._pointer][1];
        for (i = 0, n = this._reporters.length; i < n; i++) {
          fn = this._reporters[i][method];
          if (fn) fn.call(this._reporters[i], event);
        }
        this._pointer += 1;
      }
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
        this._queue[event.eventId] = [method, event];
        this.flush();
      });
    })(n);
})();

