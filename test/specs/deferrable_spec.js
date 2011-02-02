JS.ENV.DeferrableSpec = JS.Test.describe(JS.Deferrable, function() {
  include(JS.Test.FakeClock)
  
  before(function() { clock.stub() })
  after(function() { clock.reset() })
  
  before(function() {
    var Future    = new JS.Class(JS.Deferrable)
    this.future   = new Future()
    this.values   = []
    this.callback = function(v) { values.push(v) }
  })
  
  describe("in the deferred state", function() {
    describe("#callback", function() {
      it("does not fire callbacks immmediately", function() {
        future.callback(callback)
        assertEqual( [], values )
      })
      
      it("fires a callback when succeed() is called", function() {
        future.callback(callback)
        expect(future, "cancelTimeout").returning(undefined)
        future.succeed("hello")
        assertEqual( ["hello"], values )
      })
      
      it("does not fire callbacks when fail() is called", function() {
        future.callback(callback)
        future.fail("oh no")
        assertEqual( [], values )
      })
      
      it("can modify future callback values", function() {
        future.callback(callback)
        future.callback(function() { future.succeed("changed") })
        future.succeed("hello")
        assertEqual( ["changed"], values )
      })
    })
    
    describe("#errback", function() {
      it("does not fire errbacks immmediately", function() {
        future.errback(callback)
        assertEqual( [], values )
      })
      
      it("fires errbacks when fail() is called", function() {
        future.errback(callback)
        expect(future, "cancelTimeout").returning(undefined)
        future.fail("oh no")
        assertEqual( ["oh no"], values )
      })
      
      it("does not fire errbacks when succeed() is called", function() {
        future.errback(callback)
        future.succeed("oh no")
        assertEqual( [], values )
      })
    })
    
    describe("#timeout", function() {
      it("fires errbacks after a timeout", function() {
        future.errback(callback)
        future.timeout(200)
        clock.tick(250)
        assertEqual( [a(JS.Deferrable.Timeout)], values )
      })
      
      it("can be cancelled using cancelTimeout()", function() {
        future.errback(callback)
        future.timeout(200)
        clock.tick(100)
        future.cancelTimeout()
        clock.tick(150)
        assertEqual( [], values )
      })
    })
  })
  
  describe("in the success state", function() {
    before(function() { future.succeed("done") })
    
    it("fires a callback immediately", function() {
      future.callback(callback)
      assertEqual( ["done"], values )
    })
    
    it("does not re-call a callback if succeed() is called", function() {
      future.callback(callback)
      future.succeed("again")
      assertEqual( ["done"], values )
    })
    
    it("does not allow errbacks to be added", function() {
      future.errback(callback)
      future.fail("fail")
      assertEqual( [], values )
    })
  })
  
  describe("in the failure state", function() {
    before(function() { future.fail("fail") })
    
    it("fires an errback immediately", function() {
      future.errback(callback)
      assertEqual( ["fail"], values )
    })
    
    it("does not re-call an errback if fail() is called", function() {
      future.errback(callback)
      future.fail("again")
      assertEqual( ["fail"], values )
    })
    
    it("does not allow callbacks to be added", function() {
      future.callback(callback)
      future.succeed("done")
      assertEqual( [], values )
    })
  })
})
