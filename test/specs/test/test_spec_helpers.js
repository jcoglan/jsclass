JS.ENV.TestSpecHelpers = new JS.Module({
  suite: function(tests) {
    return new JS.Class("TestedSuite", JS.Test.Unit.TestCase, tests).suite()
  },
  
  createTestEnvironment: function() {
    this.result = new JS.Test.Unit.TestResult()
    this.faults = []
    this.result.addListener(JS.Test.Unit.TestResult.FAULT, this.faults.push, this.faults)
  },
  
  runTests: function(tests, resume) {
    if (tests) this.testcase = this.suite(tests)
    JS.Test.showStack = false
    this.testcase.run(this.result, function() {
      if (resume) resume()
      JS.Test.showStack = true
    }, function() {})
  },
  
  assertTestResult: function(runs, assertions, failures, errors) { with(this) {
    __wrapAssertion__(function() { with(this) {
      assertEqual( runs,        result.runCount(),        "Incorrect run count" )
      assertEqual( assertions,  result.assertionCount(),  "Incorrect assertion count" )
      assertEqual( failures,    result.failureCount(),    "Incorrect failure count" )
      assertEqual( errors,      result.errorCount(),      "Incorrect error count" )
      
      assertEqual( failures + errors, faults.length )
    }})
  }},
  
  assertMessage: function(index, message) { with(this) {
    if (typeof index === "string") {
      message = index
      index   = 1
    }
    assertEqual( message, faults[index-1].longDisplay() )
  }}
})

