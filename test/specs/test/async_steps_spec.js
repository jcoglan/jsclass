JS.ENV.Test = JS.ENV.Test || {}

Test.AsyncStepsSpec = JS.Test.describe(JS.Test.AsyncSteps, function() {
  if (typeof setTimeout === 'undefined') return
  
  before(function() {
    this.StepModule = JS.Test.asyncSteps({
      multiply: function(x, y, callback) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result = x * y
          callback()
        }, 100)
      },
      subtract: function(n, callback) {
        var self = this
        JS.ENV.setTimeout(function() {
          self.result -= n
          callback()
        }, 100)
      },
      checkResult: function(n, callback) {
        this.assertEqual(n, this.result)
        callback()
      }
    })
    this.steps = new JS.Singleton(StepModule)
  })
  
  describe("#sync", function() {
    describe("with no steps pending", function() {
      it("runs the callback immediately", function() {
        var result
        steps.sync(function() { result = typeof steps.result })
        assertEqual( "undefined", result )
      })
    })
    
    describe("with a pending step", function() {
      before(function() { steps.multiply(7,8) })
      
      it("waits for the step to complete", function(resume) {
        var result
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 56, steps.result ) })
        })
      })
    })
    
    describe("with many pending steps", function() {
      before(function() {
        steps.multiply(7,8)
        steps.subtract(5)
      })
      
      it("waits for all the steps to complete", function(resume) {
        var result
        assertEqual( undefined, steps.result )
        steps.sync(function() {
          resume(function() { assertEqual( 51, steps.result ) })
        })
      })
    })
  })
  
  describe("Test.Unit integration", function() {
    before(function() {
      this.MathTest = JS.Test.describe("MathSpec", function() {
        it("passes", function() {
          multiply(6,3)
          subtract(7)
          checkResult(11)
        })
        it("fails", function() {
          multiply(9,4)
          checkResult(5)
        })
      })
      this.MathTest.include(StepModule)
      this.result = new JS.Test.Unit.TestResult()
      this.faults = []
      this.result.addListener(JS.Test.Unit.TestResult.FAULT, this.faults.push, this.faults)
    })
    
    it("hides all the async stuff", function(resume) {
      MathTest.suite().run(result, function() {
        resume(function() {
          assertEqual( 2, result.runCount() )
          assertEqual( 2, result.assertionCount() )
          assertEqual( 1, result.failureCount() )
          assertEqual( 0, result.errorCount() )
        })
      }, function() {})
    })
  })
})
