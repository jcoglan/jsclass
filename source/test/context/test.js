JS.Test.Context.Test = new JS.Module({
  test: function(name, opts, block) {
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

  beforeTest: function(name, block) {
    this.test(name, {before: block}, function() {});
  }
});

JS.Test.Context.Test.alias({
  it:     'test',
  should: 'test',
  tests:  'test',

  beforeIt:     'beforeTest',
  beforeShould: 'beforeTest',
  beforeTests:  'beforeTest'
});

