JS.Test.Mocking.Stub.include({
  given: function() {
    var matcher = new JS.Test.Mocking.Parameters(arguments, this._expected);
    this._argMatchers.push(matcher);
    return this;
  },
  
  raises: function(exception) {
    this._lastMatcher()._exception = exception;
    return this;
  },
  
  returns: function() {
    this._lastMatcher().returns(arguments);
    return this;
  },
  
  yields: function() {
    this._lastMatcher().yields(arguments);
    return this;
  }
});

JS.Test.Mocking.Stub.include({
  raising:    JS.Test.Mocking.Stub.instanceMethod('raises'),
  returning:  JS.Test.Mocking.Stub.instanceMethod('returns'),
  yielding:   JS.Test.Mocking.Stub.instanceMethod('yields')
});

JS.Test.Mocking.extend({      
  DSL: new JS.Module({
    stub: function() {
      return JS.Test.Mocking.stub.apply(JS.Test.Mocking, arguments);
    },
    
    expect: function(object, methodName) {
      var stub = JS.Test.Mocking.stub(object, methodName);
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
    
    a: function(type) {
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

JS.Test.Mocking.DSL.include({
  an: JS.Test.Mocking.DSL.instanceMethod('a')
});

JS.Test.Unit.TestCase.include(JS.Test.Mocking.DSL);
JS.Test.Unit.mocking = JS.Test.Mocking;

