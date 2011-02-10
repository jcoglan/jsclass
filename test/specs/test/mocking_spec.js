JS.ENV.Test = JS.ENV.Test || {}

JS.ENV.Test.MockingSpec = JS.Test.describe(JS.Test.Mocking, function() {
  include(JS.Test.Helpers)
  include(TestSpecHelpers)
  before(function() { createTestEnvironment() })
  
  before(function() {
    this.object = {getName: function() { return "jester" }}
    this.object.toString = function() { return "[OBJECT]" }
  })
  
  describe("stub", function() {
    describe("without specified arguments", function() {
      it("replaces a method on an object for any arguments", function() {
        stub(object, "getName").returns("king")
        assertEqual( "king", object.getName() )
        assertEqual( "king", object.getName("any", "args") )
      })
      
      it("revokes the stub", function() {
        stub(object, "getName").returns("king")
        JS.Test.Mocking.removeStubs()
        assertEqual( "jester", object.getName() )
      })
    })
    
    describe("with no arguments", function() {
      before(function() {
        stub(object, "getName").given().returns("king")
      })
      
      it("responsed to calls with no arguments", function() {
        assertEqual( "king", object.getName() )
      })
      
      it("does not respond to calls with arguments", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName(1) })
      })
    })
    
    describe("with arguments", function() {
      before(function() {
        stub(object, "getName").given(1).returns("one", "ONE")
        stub(object, "getName").given(2).returns("two", "TWO")
        stub(object, "getName").given(1,2).returns("twelve")
        stub(object, "getName").given(1,3).returns("thirteen")
      })
      
      it("dispatches based on the arguments", function() {
        assertEqual( "one",      object.getName(1) )
        assertEqual( "two",      object.getName(2) )
        assertEqual( "twelve",   object.getName(1,2) )
        assertEqual( "thirteen", object.getName(1,3) )
      })
      
      it("allows sequences of return values", function() {
        assertEqual( "one", object.getName(1) )
        assertEqual( "two", object.getName(2) )
        assertEqual( "ONE", object.getName(1) )
        assertEqual( "TWO", object.getName(2) )
      })
      
      it("throws an error for unexpected arguments", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName(4) })
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName() })
      })
      
      describe("when an any-arg matcher is present", function() {
        before(function() { stub(object, "getName") })
        
        it("allows calls with any arguments", function() {
          assertNothingThrown(function() { object.getName(4) })
        })
      })
    })
    
    describe("with a fake implementation", function() {
      before(function() {
        stub(object, "getName", function() { return "hello" })
      })
      
      it("uses the fake implementation when calling the method", function() {
        assertEqual( "hello", object.getName() )
      })
      
      describe("with arguments", function() {
        before(function() {
          object.n = 2
          stub(object, "getName", function(a) { return a * this.n })
        })
        
        it("uses the fake implementation when calling the method", function() {
          assertEqual( 6, object.getName(3) )
        })
        
        describe("when there are parameter matchers", function() {
          before(function() {
            stub(object, "getName").given(5).returns("fail")
          })
          
          it("only uses the fake if no patterns match", function() {
            assertEqual( "fail", object.getName(5) )
            assertEqual( 12,     object.getName(6) )
          })
        })
      })
    })
    
    describe("with a matcher argument", function() {
      before(function() {
        stub(object, "getName").given(arrayIncluding("foo")).returns(true)
        stub(object, "getName").given(arrayIncluding("bar", "qux")).returns(true)
        stub(object, "getName").given(arrayIncluding("bar")).returns(false)
      })
      
      it("dispatches to the pattern that matches the input", function() {
        assert( object.getName(["something", "foo", "else"]) )
        assert( !object.getName(["these", "words", "bar"]) )
        assert( object.getName(["qux", "words", "bar"]) )
      })
      
      it("throws an error for unexpected arguments", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName(["qux"]) })
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName() })
      })
    })
    
    describe("yields", function() {
      before(function() {
        stub(object, "getName").given().yields(["no", "args"], ["and", "again"])
        stub(object, "getName").given("a").yields(["one arg"])
        stub(object, "getName").given("a", "b").yields(["very", "many", "args"])
      })
      
      it("returns the stubbed value using a callback", function() {
        var a, b, c, context = {}
        
        object.getName(          function() { a = JS.array(arguments) })
        object.getName("a",      function() { b = [JS.array(arguments), this] }, context)
        object.getName("a", "b", function() { c = JS.array(arguments) })
        
        assertEqual( ["no", "args"], a )
        assertEqual( [["one arg"], context], b )
        assertEqual( ["very", "many", "args"], c )
      })
      
      it("allows sequences of yield values", function() {
        var a, b
        object.getName(function() { a = JS.array(arguments) })
        object.getName(function() { b = JS.array(arguments) })
        
        assertEqual( ["no", "args"], a )
        assertEqual( ["and", "again"], b )
      })
      
      it("throws an error for unexpected arguments", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() {
          object.getName("b", function() {})
        })
      })
      
      it("throws an error if no callback is given", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName("a") })
      })
      
      describe("when an any-arg matcher is present", function() {
        before(function() {
          stub(object, "getName").yields(["some", "args"])
        })
        
        it("allows calls with any arguments", function() {
          assertNothingThrown(function() { object.getName(function() {}) })
          assertNothingThrown(function() { object.getName(4, function() {}) })
          assertNothingThrown(function() { object.getName(5,6,7, function() {}) })
        })
        
        it("throws an error if no callback is given", function() {
          assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName("a") })
        })
      })
    })
    
    describe("raises", function() {
      before(function() {
        this.error = new TypeError()
        stub(object, "getName").given(5,6).raises(error)
      })
      
      it("throws the given error if the arguments match", function() {
        assertThrows(TypeError, function() { object.getName(5,6) })
      })
      
      it("throws UnexpectedCallError if the arguments do not match", function() {
        assertThrows(JS.Test.Mocking.UnexpectedCallError, function() { object.getName(5,6,7) })
      })
    })
  })
  
  describe("mocking", function() {
    it("passes if the method was called", function(resume) {
      runTests({
        testExpectMethod: function() { with(this) {
          expect(object, "getName").returning("me")
          object.getName()
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 0, 0 )
      })})
    })
    
    it("fails if the method was not called", function(resume) {
      runTests({
        testExpectMethod: function() { with(this) {
          expect(object, "getName")
        }}
      }, function() { resume(function() {
        assertTestResult( 1, 1, 1, 0 )
        assertMessage( 1, "Failure:\n" +
                          "testExpectMethod(TestedSuite):\n" +
                          "Mock expectation not met.\n" +
                          "<[OBJECT]> expected to receive call\n" +
                          "getName(*arguments)." )
      })})
    })
    
    describe("#atLeast", function() {
      it("passes if the method was called enough times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").atLeast(3).returning("me")
            object.getName()
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 0, 0 )
        })})
      })
      
      it("fails if the method was not called enough times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").atLeast(3).returning("me")
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectMethod(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments)\n" +
                            "at least 3 times\n" +
                            "but 2 calls were made." )
        })})
      })
      
      it("fails if the method was not called at all", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").atLeast(3).returning("me")
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectMethod(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments)." )
        })})
      })
    })
    
    describe("#atMost", function() {
      it("passes if the method was called enough times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").atMost(3).returning("me")
            object.getName()
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 0, 0 )
        })})
      })
      
      it("fails if the method was called too many times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").atMost(3).returning("me")
            object.getName()
            object.getName()
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectMethod(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments)\n" +
                            "at most 3 times\n" +
                            "but 4 calls were made." )
        })})
      })
      
      it("passes if the method was not called at all", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").returning("me").atMost(3)
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 0, 0 )
        })})
      })
    })
    
    describe("#exactly", function() {
      it("passes if the method was called enough times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").exactly(2).returning("me")
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 0, 0 )
        })})
      })
      
      it("fails if the method was called too many times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").exactly(2).returning("me")
            object.getName()
            object.getName()
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectMethod(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments)\n" +
                            "exactly 2 times\n" +
                            "but 3 calls were made." )
        })})
      })
      
      it("fails if the method was called too few times", function(resume) {
        runTests({
          testExpectMethod: function() { with(this) {
            expect(object, "getName").exactly(2).returning("me")
            object.getName()
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectMethod(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments)\n" +
                            "exactly 2 times\n" +
                            "but 1 call was made." )
        })})
      })
    })
    
    describe("with argument matchers", function() {
      it("passes if the method was called with the right arguments", function(resume) {
        runTests({
          testExpectWithArgs: function() { with(this) {
            expect(object, "getName").given(3,4).returning(7)
            assertEqual( 7, object.getName(3,4) )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails if the method was called with the wrong arguments", function(resume) {
        runTests({
          testExpectWithArgs: function() { with(this) {
            expect(object, "getName").given(3,4).returning(7)
            object.getName(3,9)
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 1 )
          assertMessage( 1, "Error:\n" +
                            "testExpectWithArgs(TestedSuite):\n" +
                            "Error: <[OBJECT]> received call to getName() with unexpected arguments:\n" +
                            "(3,9)" )
          assertMessage( 2, "Failure:\n" +
                            "testExpectWithArgs(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(3,4)." )
        })})
      })
      
      it("fails if the method was not called", function(resume) {
        runTests({
          testExpectWithArgs: function() { with(this) {
            expect(object, "getName").given(3,4).returning(7)
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectWithArgs(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(3,4)." )
        })})
      })
    })
    
    describe("with yielding", function() {
      it("passes if the method was called", function(resume) {
        runTests({
          testExpectWithYields: function() { with(this) {
            var result
            expect(object, "getName").yielding([5])
            object.getName(function(r) { result = r })
            assertEqual( 5, result )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("passes if the method was called with any args", function(resume) {
        runTests({
          testExpectWithYields: function() { with(this) {
            var result
            expect(object, "getName").given(anyArgs()).yielding([5])
            object.getName("oh", "hai", function(r) { result = r })
            assertEqual( 5, result )
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 2, 0, 0 )
        })})
      })
      
      it("fails if the method was not called", function(resume) {
        runTests({
          testExpectWithYields: function() { with(this) {
            expect(object, "getName").yielding([5])
          }}
        }, function() { resume(function() {
          assertTestResult( 1, 1, 1, 0 )
          assertMessage( 1, "Failure:\n" +
                            "testExpectWithYields(TestedSuite):\n" +
                            "Mock expectation not met.\n" +
                            "<[OBJECT]> expected to receive call\n" +
                            "getName(*arguments,a(Function))." )
        })})
      })
      
      describe("with argument matchers", function() {
        it("passes if the method was called with the right arguments", function(resume) {
          runTests({
            testExpectWithYields: function() { with(this) {
              var result
              expect(object, "getName").given(5,6).yielding([11])
              object.getName(5, 6, function(r) { result = r })
              assertEqual( 11, result )
            }}
          }, function() { resume(function() {
            assertTestResult( 1, 2, 0, 0 )
          })})
        })
        
        it("fails if the method was called with the wrong arguments", function(resume) {
          runTests({
            testExpectWithYields: function() { with(this) {
              expect(object, "getName").given(5,6).yielding([11])
              object.getName(5, 8, function() {})
            }}
          }, function() { resume(function() {
            assertTestResult( 1, 1, 1, 1 )
            assertMessage( 1, "Error:\n" +
                              "testExpectWithYields(TestedSuite):\n" +
                              "Error: <[OBJECT]> received call to getName() with unexpected arguments:\n" +
                              "(5,8,#function)" )
            assertMessage( 2, "Failure:\n" +
                              "testExpectWithYields(TestedSuite):\n" +
                              "Mock expectation not met.\n" +
                              "<[OBJECT]> expected to receive call\n" +
                              "getName(5,6,a(Function))." )
          })})
        })
      })
    })
  })
  
  describe("matchers", function() {
    describe("anything", function() {
      it("matches anything", function() {
        assertEqual( anything(), null )
        assertEqual( anything(), undefined )
        assertEqual( anything(), 0 )
        assertEqual( anything(), "" )
        assertEqual( anything(), false )
        assertEqual( anything(), function() {} )
        assertEqual( anything(), /foo/ )
        assertEqual( anything(), [] )
        assertEqual( anything(), [] )
        assertEqual( anything(), new Date() )
      })
    })
    
    describe("anyArgs", function() {
      it("matches any number of items at the end of a list", function() {
        assertEqual( [anyArgs()], [1,2,3] )
      })
    })
    
    describe("instanceOf", function() {
      it("matches instances of the given type", function() {
        assertEqual( instanceOf(JS.Set), new JS.SortedSet() )
        assertEqual( instanceOf(JS.Enumerable), new JS.Hash() )
        assertEqual( instanceOf(String), "hi" )
        assertEqual( instanceOf("string"), "hi" )
        assertEqual( instanceOf(Number), 9 )
        assertEqual( instanceOf("number"), 9 )
        assertEqual( instanceOf(Boolean), false )
        assertEqual( instanceOf("boolean"), true )
        assertEqual( instanceOf(Array), [] )
        assertEqual( instanceOf("object"), {} )
        assertEqual( instanceOf("function"), function() {} )
        assertEqual( instanceOf(Function), function() {} )
      })
      
      it("does not match instances of other types", function() {
        assertNotEqual( instanceOf("object"), 9 )
        assertNotEqual( instanceOf(JS.Comparable), new JS.Set )
        assertNotEqual( instanceOf(JS.SortedSet), new JS.Set )
        assertNotEqual( instanceOf(Function), "string" )
        assertNotEqual( instanceOf(Array), {} )
      })
    })
    
    describe("match", function() {
      it("matches objects the match the type", function() {
        assertEqual( match(/foo/), "foo" )
        assertEqual( match(JS.Enumerable), new JS.Set() )
      })
      
      it("does not match objects that don't match the type", function() {
        assertNotEqual( match(/foo/), "bar" )
        assertNotEqual( match(JS.Enumerable), new JS.Class() )
      })
    })
    
    describe("arrayIncluding", function() {
      it("matches an array containing all the required elements", function() {
        assertEqual( arrayIncluding("foo"), ["hi", "foo", "there"] )
        assertEqual( arrayIncluding(), ["hi", "foo", "there"] )
        assertEqual( arrayIncluding("foo", "bar"), ["bar", "hi", "foo", "there"] )
      })
      
      it("does not match other data types", function() {
        assertNotEqual( arrayIncluding("foo"), {foo: true} )
        assertNotEqual( arrayIncluding("foo"), true )
        assertNotEqual( arrayIncluding("foo"), "foo" )
        assertNotEqual( arrayIncluding("foo"), null )
        assertNotEqual( arrayIncluding("foo"), undefined )
      })
      
      it("does not match arrays that don't contain all the required elements", function() {
        assertNotEqual( arrayIncluding("foo", "bar"), ["hi", "foo", "there"] )
        assertNotEqual( arrayIncluding("foo", "bar"), ["bar", "hi", "there"] )
      })
    })
    
    describe("objectIncluding", function() {
      it("matches an object containing all the required pairs", function() {
        assertEqual( objectIncluding({foo: true}), {hi: true, foo: true, there: true} )
        assertEqual( objectIncluding(), {hi: true, foo: true, there: true} )
        assertEqual( objectIncluding({bar: true, foo: true}), {bar: true, hi: true, foo: true, there: true} )
      })
      
      it("does not match other data types", function() {
        assertNotEqual( objectIncluding({foo: true}), ["foo"] )
        assertNotEqual( objectIncluding({foo: true}), true )
        assertNotEqual( objectIncluding({foo: true}), "foo" )
        assertNotEqual( objectIncluding({foo: true}), null )
        assertNotEqual( objectIncluding({foo: true}), undefined )
      })
      
      it("does not match objects that don't contain all the required pairs", function() {
        assertNotEqual( objectIncluding({bar: true, foo: true}), {bar: false, hi: true, foo: true, there: true} )
        assertNotEqual( objectIncluding({bar: true, foo: true}), {bar: true, hi: true, there: true} )
      })
    })
  })
})

