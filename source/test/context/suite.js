(function() {
  var suite = JS.Test.Unit.TestCase.suite;

  JS.Test.Unit.TestCase.extend({
    // Tweaks to standard method so we don't get superclass methods and we don't
    // get weird default tests
    suite: function(filter) {
      return suite.call(this, filter, false, false);
    }
  });
})();

JS.Test.Unit.TestSuite.include({
  run: function(result, continuation, callback, context) {
    callback.call(context || null, this.klass.STARTED, this);

    var withIvars = function(ivarsFromCallback) {
      this.forEach(function(test, resume) {
        if (ivarsFromCallback) test.setValuesFromCallbacks(ivarsFromCallback);
        test.run(result, resume, callback, context);

      }, function() {
        var afterCallbacks = function() {
          callback.call(context || null, this.klass.FINISHED, this);
          continuation.call(context || null);
        };
        if (ivarsFromCallback) first.runAllCallbacks('after', afterCallbacks, this);
        else afterCallbacks.call(this);

      }, this);
    };

    var first = this._tests[0], ivarsFromCallback = null;

    if (first && first.runAllCallbacks)
      first.runAllCallbacks('before', withIvars, this);
    else
      withIvars.call(this, null);
  }
});

