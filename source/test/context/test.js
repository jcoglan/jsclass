Test.Context.Test = new JS.Module({
  it: function(name, opts, block) {
    var testName = 'test: ' + name;

    if (JS.indexOf(this.instanceMethods(false), testName) >= 0)
      throw new Error(testName + ' is already defined in ' + this.displayName);

    opts = opts || {};

    if (typeof opts === 'function') {
      block = opts;
    } else {
      if (opts.before !== undefined)
        this.before_should_callbacks[testName] = opts.before;
    }

    this.define(testName, block, {_resolve: false});
  },

  should: function() { return this.it.apply(this, arguments) },
  test:   function() { return this.it.apply(this, arguments) },
  tests:  function() { return this.it.apply(this, arguments) },

  beforeTest: function(name, block) {
    this.it(name, {before: block}, function() {});
  }
});

Test.Context.Test.alias({
  beforeIt:     'beforeTest',
  beforeShould: 'beforeTest',
  beforeTests:  'beforeTest'
});

