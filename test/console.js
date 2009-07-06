JSCLASS_PATH = 'build/min/';
load (JSCLASS_PATH + 'loader.js');

require('JS.Test.Unit', 'JS.Set', function() {
  TestFoo = new JS.Class('TestFoo', JS.Test.Unit.TestCase, {
    testError: function() {
      this.noneSuch();
    },
    
    testFlunk: function() {
      this.flunk('Write tests or I will kneecap you')
    },
    
    testAssert: function() {
      this.assert(true);
      this.assert(false);
    },
    
    testAssertEqual: function() {
      this.assertEqual('foo', 'foo');
      this.assertEqual('foo', 'bar');
    },
    
    testAssertNotEqual: function() {
      this.assertNotEqual('foo', 'bar');
      this.assertNotEqual('foo', 'foo');
    },
    
    testAssertEqualArrays: function() {
      this.assertEqual([1,2,[3,4,5],6], [1,2,[3,4,5],6]);
      this.assertEqual([1,2,[3,8,5],6], [1,2,[3,4,5],6]);
    },
    
    testAssertEqualSets: function() {
      this.assertEqual(new JS.Set([1,2,3]), new JS.HashSet([3,2,1]));
      this.assertEqual(new JS.Set([1,2,3]), new JS.HashSet([4,2,1]));
    },
    
    testAssertNull: function() {
      this.assertNull(null);
      this.assertNull(false);
    },
    
    testAssertNotNull: function() {
      this.assertNotNull(false);
      this.assertNotNull(null);
    },
    
    testAssertKindOf: function() {
      this.assertKindOf(Array, []);
      this.assertKindOf(Function, []);
    },
    
    testAssertRespondTo: function() {
      this.assertRespondTo('string', 'toUpperCase');
      this.assertRespondTo('string', 'quack', 'This is odd.');
    },
    
    testAssertMatch: function() {
      this.assertMatch(/foo/, 'food');
      this.assertMatch(/foo/, 'foal');
    },
    
    testAssertNoMatch: function() {
      this.assertNoMatch(/foo/, 'foal');
      this.assertNoMatch(/foo/, 'food');
    },
    
    testAssertSame: function() {
      var a = [1,2,3];
      this.assertSame(a, a);
      this.assertSame(a, [1,2,3]);
    },
    
    testAssertNotSame: function() {
      var a = [1,2,3];
      this.assertNotSame(a, [1,2,3]);
      this.assertNotSame(a, a);
    },
    
    testAssertInDelta: function() {
      this.assertInDelta(9,8,1);
      this.assertInDelta(9,7,1);
    },
    
    testAssertSend: function() {
      this.assertSend([/foo/, 'test', 'food']);
      this.assertSend([/foo/, 'test', 'foal']);
    },
    
    testAssertThrowWithNoException: function() {
      this.assertThrow(TypeError, function() { JS.foo() });
      this.assertThrow(TypeError, String, 'No error!', function() { JS.makeFunction() }, this);
    },
    
    testAssertThrowWithIncorrectException: function() {
      this.assertThrows(TypeError, function() { JS.foo() });
      this.assertThrow(JS.Test.Unit.AssertionFailedError, function() { JS.foo() });
    },
    
    testAssertNothingThrown: function() {
      this.assertNothingThrown(function() { JS.makeFunction() });
      this.assertNothingThrown(function() { JS.foo() });
    }
  });

  JS.Test.Unit.UI.Console.TestRunner.run(TestFoo);
});

