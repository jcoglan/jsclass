JS.ENV.Test = JS.ENV.Test || {}

Test.AsyncStepsSpec = JS.Test.describe(JS.Test.AsyncSteps, function() { with(this) {
  if (typeof JS.ENV.setTimeout === 'undefined') return
  
  before(function() { with(this) {
    this.StepModule = JS.Test.asyncSteps({
      multiply: function(x, y, callback) { with(this) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result = x * y
          callback()
        }, 100)
      }},
      subtract: function(n, callback) { with(this) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result -= n
          callback()
        }, 100)
      }},
      zero: function(callback) { with(this) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result = FakeMath.zero()
          callback()
        }, 100)
      }},
      checkResult: function(n, callback) { with(this) {
        assertEqual(n, result)
        callback()
      }},
      deleteFakemath: function(callback) { with(this) {
        JS.ENV.FakeMath = undefined
        callback()
      }},
      throwError: function(callback) { with(this) {
        JS.ENV.setTimeout(function() {
          throw new Error("async error")
          callback()
        }, 10)
      }}
    })
    this.steps = new JS.Singleton(StepModule)
  }})
  
  describe("#sync", function() { with(this) {
    describe("with no steps pending", function() { with(this) {
      it("runs the callback immediately", function() { with(this) {
        var result
        steps.sync(function() { result = typeof steps.result })
        assertEqual( "undefined", result )
      }})
    }})
    
    describe("with a pending step", function() { with(this) {
      before(function() { this.steps.multiply(7,8) })
      
      it("waits for the step to complete", function(resume) { with(this) {
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 56, steps.result ) })
        })
      }})
    }})
    
    describe("with many pending steps", function() { with(this) {
      before(function() { with(this) {
        steps.multiply(7,8)
        steps.subtract(5)
      }})
      
      it("waits for all the steps to complete", function(resume) { with(this) {
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 51, steps.result ) })
        })
      }})
    }})
    
    describe("with FakeClock activated", function() { with(this) {
      include(JS.Test.FakeClock)
      before(function() { this.clock.stub() })
      after(function() { this.steps.sync(this.clock.method('reset')) })
      
      it("waits for all the steps to complete", function(resume) { with(this) {
        steps.result = 11
        steps.checkResult(11)
        steps.sync(resume)
      }})
    }})
  }})
  
  describe("Test.Unit integration", function() { with(this) {
    before(function() { with(this) {
      this.MathTest = JS.Test.describe("MathSpec", function() { with(this) {
        include(StepModule)
        before(function() { with(this) {
          JS.ENV.FakeMath = {}
          stub(FakeMath, "zero").returns(0)
        }})
        after(function() { with(this) {
          multiply(6,7)
        }})
        after(function() { with(this) {
          checkResult(42)
          deleteFakemath()
        }})
        after(function(resume) { this.sync(resume) })
        
        it("passes", function() { with(this) {
          multiply(6,3)
          subtract(7)
          checkResult(11)
        }})
        it("fails", function() { with(this) {
          multiply(9,4)
          checkResult(5)  // should fail
          checkResult(5)  // should not run
        }})
        it("uses stubs", function() { with(this) {
          zero()
          checkResult(0)
        }})
        it("catches async errors", function() { with(this) {
          throwError()
        }})
      }})
      MathTest.resolve()
      this.result = new JS.Test.Unit.TestResult()
      this.faults = []
      this.result.addListener(JS.Test.Unit.TestResult.FAULT, this.faults.push, this.faults)
    }})
    
    it("hides all the async stuff", function(resume) { with(this) {
      MathTest.suite().run(result, function() {
        resume(function() {
          assertEqual( 4, result.runCount() )
          assertEqual( 7, result.assertionCount() )
          assertEqual( 1, result.failureCount() )
          assertEqual( 1, result.errorCount() )
        })
      }, function() {})
    }})
  }})
}})

