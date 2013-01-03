Test.Mocking.Stub.include({
  given: function() {
    var matcher = new Test.Mocking.Parameters(arguments, this._expected);
    this._argMatchers.push(matcher);
    this._currentMatcher = matcher;
    return this;
  },

  raises: function(exception) {
    this._currentMatcher._exception = exception;
    return this;
  },

  returns: function() {
    this._currentMatcher.returns(arguments);
    return this;
  },

  yields: function() {
    this._currentMatcher.yields(arguments);
    return this;
  },

  atLeast: function(n) {
    this._currentMatcher.setMinimum(n);
    return this;
  },

  atMost: function(n) {
    this._currentMatcher.setMaximum(n);
    return this;
  },

  exactly: function(n) {
    this._currentMatcher.setExpected(n);
    return this;
  }
});

Test.Mocking.Stub.alias({
  raising:    'raises',
  returning:  'returns',
  yielding:   'yields'
});

Test.Mocking.extend({
  DSL: new JS.Module({
    stub: function() {
      return Test.Mocking.stub.apply(Test.Mocking, arguments);
    },

    expect: function() {
      var stub = Test.Mocking.stub.apply(Test.Mocking, arguments);
      stub.expected();
      this.addAssertion();
      return stub;
    },

    anything: function() {
      return new Test.Mocking.Anything();
    },

    anyArgs: function() {
      return new Test.Mocking.AnyArgs();
    },

    instanceOf: function(type) {
      return new Test.Mocking.InstanceOf(type);
    },

    match: function(type) {
      return new Test.Mocking.Matcher(type);
    },

    arrayIncluding: function() {
      return new Test.Mocking.ArrayIncluding(arguments);
    },

    objectIncluding: function(elements) {
      return new Test.Mocking.ObjectIncluding(elements);
    }
  })
});

Test.Unit.TestCase.include(Test.Mocking.DSL);
Test.Unit.mocking = Test.Mocking;

