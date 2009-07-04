load ('build/src/core.js');
load ('build/src/enumerable.js');
load ('build/src/test.js');

TestFoo = new JS.Class('TestFoo', JS.Test.Unit.TestCase, {
  testSomething: function() {
    this.assert(true);
    this.assert(true);
    this.assrt(false);
  },
  
  testAnotherThing: function() {
    this.assert(false);
  }
});

JS.Test.Unit.UI.Console.TestRunner.run(TestFoo);

