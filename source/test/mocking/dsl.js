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

