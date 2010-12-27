JS.Test.Mocking.extend({      
  DSL: new JS.Module({
    stub: function(object, methodName) {
      return JS.Test.Mocking.stub(object, methodName);
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

