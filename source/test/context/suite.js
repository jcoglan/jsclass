JS.Test.Unit.TestCase.extend({
  // Tweaks to standard method so we don't get superclass methods and we don't
  // get weird default tests
  suite: function() {
    var methodNames = new JS.Enumerable.Collection(this.instanceMethods(false)),
        tests = methodNames.select(function(name) { return /^test./.test(name) }).sort(),
        suite = new JS.Test.Unit.TestSuite(this.displayName);
    
    for (var i = 0, n = tests.length; i < n; i++) {
      try { suite.push(new this(tests[i])) } catch (e) {}
    }
    
    return suite;
  }
});

JS.Test.Unit.TestSuite.include({
  run: function(result, block, context) {
    block.call(context || null, this.klass.STARTED, this._name);
    
    var first = this._tests[0], ivarsFromCallback = null;
    if (first && first.runAllCallbacks) ivarsFromCallback = first.runAllCallbacks('before');
    
    this.forEach(function(test) {
      if (ivarsFromCallback) test.setValuesFromCallbacks(ivarsFromCallback);
      test.run(result, block, context);
    });
    
    if (ivarsFromCallback) first.runAllCallbacks('after');
    block.call(context || null, this.klass.FINISHED, this._name);
  }
});

