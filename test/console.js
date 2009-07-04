JSCLASS_PATH = 'build/min/';
load (JSCLASS_PATH + 'loader.js');

require('JS.Test.Unit', function() {
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
});

