TestSpec = JS.Test.describe("Test", function() { with(this) {
  
  def("suite", function(tests) {
    return new JS.Class("TestedSuite", JS.Test.Unit.TestCase, tests).suite()
  })
  
  def("assertTestResult", function(runs, assertions, failures, errors) { with(this) {
    __wrapAssertion__(function() { with(this) {
      assertEqual( runs,        result.runCount() )
      assertEqual( assertions,  result.assertionCount() )
      assertEqual( failures,    result.failureCount() )
      assertEqual( errors,      result.errorCount() )
      
      assertEqual( failures + errors, faults.length )
    }})
  }})
  
  def("assertMessage", function(index, message) { with(this) {
    if (typeof index === "string") {
      message = index
      index   = 1
    }
    assertEqual( message, faults[index-1].longDisplay() )
  }})
  
  def("runTests", function(tests) {
    if (tests) this.testcase = this.suite(tests)
    this.testcase.run(this.result, function() {})
  })
  
  before("each", function() {
    this.result = new JS.Test.Unit.TestResult()
    this.faults = []
    this.result.addListener(JS.Test.Unit.TestResult.FAULT, this.faults.push, this.faults)
  })
  
  describe("empty TestCase", function() { with(this) {
    before("each", function() {
      this.runTests({})
    })
    
    it("passes with no assertions, failures or errors", function() { with(this) {
      assertTestResult( 0, 0, 0, 0 )
    }})
  }})
  
  describe("#assertBlock", function() { with(this) {
    it("passes when the block returns true", function() { with(this) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock("some message", function() { return true })
        }}
      })
      assertTestResult( 1, 1, 0, 0 )
    }})
    
    it("fails with the given message when the block returns false", function() { with(this) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock("some message", function() { return false })
        }}
      })
      assertTestResult( 1, 1, 1, 0 )
      assertMessage( "Failure:\ntestAssertBlock(TestedSuite):\nsome message." )
    }})
    
    it("fails with a default message when the block returns false", function() { with(this) {
      runTests({
        testAssertBlock: function() { with(this) {
          assertBlock(function() { return false })
        }}
      })
      assertTestResult( 1, 1, 1, 0 )
      assertMessage( "Failure:\ntestAssertBlock(TestedSuite):\nassertBlock failed." )
    }})
  }})
  
  describe("#flunk", function() { with(this) {
    it("fails with the given message", function() { with(this) {
      runTests({
        testFlunk: function() { with(this) {
          flunk("some message")
        }}
      })
      assertTestResult( 1, 1, 1, 0 )
      assertMessage( "Failure:\ntestFlunk(TestedSuite):\nsome message." )
    }})
    
    it("fails with a default message", function() { with(this) {
      runTests({
        testFlunk: function() { with(this) {
          flunk()
        }}
      })
      assertTestResult( 1, 1, 1, 0 )
      assertMessage( "Failure:\ntestFlunk(TestedSuite):\nFlunked." )
    }})
  }})
  
  describe("#assert", function() { with(this) {
    it("passes when passed truthy values", function() { with(this) {
      runTests({
        testAssert: function() { with(this) {
          assert( true )
          assert( 1 )
          assert( "word" )
          assert( {} )
          assert( [] )
          assert( function() {} )
        }}
      })
      assertTestResult( 1, 6, 0, 0 )
    }})
    
    it("fails when passed false", function() { with(this) {
      runTests({
        testAssert: function() { with(this) {
          assert( false, "It's not true" )
        }}
      })
      assertTestResult( 1, 1, 1, 0 )
      assertMessage( "Failure:\ntestAssert(TestedSuite):\nIt's not true.\n<false> is not true." )
    }})
  }})
  
  describe("#assertEqual", function() { with(this) {
    it("passes when given equal values", function() { with(this) {
      runTests({
        testAssertEqual: function() { with(this) {
          assertEqual( true, true )
          assertEqual( false, false )
          assertEqual( null, null )
          assertEqual( 0, 0.0 )
          assertEqual( 3.14, 3.14 )
          assertEqual( "foo", "foo" )
          assertEqual( [], [] )
          assertEqual( [1,2], [1,2] )
          assertEqual( [1, {foo: 2}], [1, {foo: 2}] )
          assertEqual( {}, {} )
          assertEqual( {foo: 2}, {foo: 2} )
          assertEqual( {foo: 2}, {foo: 2} )
          assertEqual( new JS.Set([1,2]), new JS.Set([2,1]) )
          
          assertNotEqual( true, false )
          assertNotEqual( false, null )
          assertNotEqual( 3, 0.3 )
          assertNotEqual( "foo", "bar" )
          assertNotEqual( [], [2,1] )
          assertNotEqual( [2,1], [] )
          assertNotEqual( {foo: 2}, {foo: 3} )
          assertNotEqual( {foo: 2}, {foo: 2, bar: 1} )
          assertNotEqual( {foo: 2, bar: 1}, {foo: 2} )
          assertNotEqual( function() {}, function() {} )
        }}
      })
      assertTestResult( 1, 23, 0, 0 )
    }})
    
    describe("with booleans", function() { with(this) {
      it("fails when given different values", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( true, false )
          }},
          
          test2: function() { with(this) {
            assertEqual( false, null, "false and null are not equal" )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<true> expected but was\n<false>." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\nfalse and null are not equal.\n<false> expected but was\n<null>." )
      }})
    }})
    
    describe("with numbers", function() { with(this) {
      it("fails when given unequal numbers", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( 3, 4 )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( 4, 4, "four is the same as itself" )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<3> expected but was\n<4>." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\nfour is the same as itself.\n<4> expected not to be equal to\n<4>." )
      }})
    }})
    
    describe("with strings", function() { with(this) {
      it("fails when given unequal strings", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( "foo", "bar" )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( "foo", "foo" )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<\"foo\"> expected but was\n<\"bar\">." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\n<\"foo\"> expected not to be equal to\n<\"foo\">." )
      }})
    }})
    
    describe("with arrays", function() { with(this) {
      it("fails when given unequal arrays", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( [1,2], [2,1] )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( [9], [9] )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<[1,2]> expected but was\n<[2,1]>." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\n<[9]> expected not to be equal to\n<[9]>." )
      }})
    }})
    
    describe("with objects", function() { with(this) {
      it("fails when given unequal objects", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( {foo: 2}, {foo: 2, bar: 3} )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( {foo: [3,4]}, {foo: [3,4]} )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<{\"foo\":2}> expected but was\n<{\"bar\":3,\"foo\":2}>." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\n<{\"foo\":[3,4]}> expected not to be equal to\n<{\"foo\":[3,4]}>." )
      }})
      
      describe("with custom equality methods", function() { with(this) {
        it("fails when given unequal objects", function() { with(this) {
          runTests({
            test1: function() { with(this) {
              assertEqual( new JS.Set([1,2]), new JS.Set([3,2]) )
            }},
            
            test2: function() { with(this) {
              assertNotEqual( new JS.Set([2,1]), new JS.Set([1,2]) )
            }}
          })
          assertTestResult( 2, 2, 2, 0 )
          
          // TODO stub Set#toString
          assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<Set:{1,2}> expected but was\n<Set:{3,2}>." )
          assertMessage( 2, "Failure:\ntest2(TestedSuite):\n<Set:{2,1}> expected not to be equal to\n<Set:{1,2}>." )
        }})
      }})
    }})
    
    describe("with functions", function() { with(this) {
      it("always fails when passed non-identical functions", function() { with(this) {
        runTests({
          test1: function() { with(this) {
            assertEqual( function() {}, function() {} )
          }},
          
          test2: function() { with(this) {
            assertNotEqual( JS.Set, JS.Set )
          }}
        })
        assertTestResult( 2, 2, 2, 0 )
        assertMessage( 1, "Failure:\ntest1(TestedSuite):\n<#function> expected but was\n<#function>." )
        assertMessage( 2, "Failure:\ntest2(TestedSuite):\n<Set> expected not to be equal to\n<Set>." )
      }})
    }})
  }})
  
}})

