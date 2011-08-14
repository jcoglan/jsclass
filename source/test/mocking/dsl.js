JS.Test.Mocking.Stub.include({
  given: function() {
    var matcher = new JS.Test.Mocking.Parameters(arguments, this._expected);
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

JS.Test.Mocking.Stub.alias({
  raising:    'raises',
  returning:  'returns',
  yielding:   'yields'
});

JS.Test.Mocking.extend({      
  DSL: new JS.Module({
    stub: function() {
      return JS.Test.Mocking.stub.apply(JS.Test.Mocking, arguments);
    },
    
    expect: function() {
      var stub = JS.Test.Mocking.stub.apply(JS.Test.Mocking, arguments);
      stub.expected();
      this.addAssertion();
      return stub;
    },
    
    anything: function() {
      return new JS.Test.Mocking.Anything();
    },
    
    anyArgs: function() {
      return new JS.Test.Mocking.AnyArgs();
    },
    
    instanceOf: function(type) {
      return new JS.Test.Mocking.InstanceOf(type);
    },
    
    match: function(type) {
      return new JS.Test.Mocking.Matcher(type);
    },
    
    arrayIncluding: function() {
      return new JS.Test.Mocking.ArrayIncluding(arguments);
    },
    
    objectIncluding: function(elements) {
      return new JS.Test.Mocking.ObjectIncluding(elements);
    }
  })
});

JS.Test.Unit.TestCase.include(JS.Test.Mocking.DSL);
JS.Test.Unit.mocking = JS.Test.Mocking;

