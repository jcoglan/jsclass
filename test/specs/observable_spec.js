JS.ENV.ObservableSpec = JS.Test.describe(JS.Observable, function() {
  before(function() {
    var Publisher  = new JS.Class(JS.Observable)
    this.publisher = new Publisher()
    
    this.counter    = 0
    this.increment  = function() { counter++ }
    
    this.subscriber = {x: 0, update: function(x) { this.x += x }}
  })
  
  describe("with no subscribers", function() {
    it("does not update the counter", function() {
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
  })
  
  describe("with a subscriber object", function() {
    before(function() {
      publisher.addObserver(subscriber)
    })
    
    it("updates the counter", function() {
      publisher.notifyObservers(4)
      assertEqual( 4, subscriber.x )
    })
    
    it("can remove the observer", function() {
      publisher.removeObserver(subscriber)
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    })
    
    it("can remove all observers", function() {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    })
    
    it("does not publish changes if set to false", function() {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    })
  })
  
  describe("with a subscriber function", function() {
    before(function() {
      publisher.addObserver(increment)
    })
    
    it("updates the counter", function() {
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    })
    
    it("can remove the observer without a context", function() {
      publisher.removeObserver(increment)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
    
    it("does not remove the observer if a different context is used", function() {
      publisher.removeObserver(increment, {})
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    })
    
    it("can remove all observers", function() {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
    
    it("does not publish changes if set to false", function() {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
  })
  
  describe("with a subscriber function and a context", function() {
    before(function() {
      publisher.addObserver(increment, this)
    })
    
    it("updates the counter", function() {
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    })
    
    it("cannot remove the observer without a context", function() {
      publisher.removeObserver(increment)
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    })
    
    it("does not remove the observer if a different context is used", function() {
      publisher.removeObserver(increment, {})
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    })
    
    it("removes the observer if the same context is used", function() {
      publisher.removeObserver(increment, this)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
    
    it("can remove all observers", function() {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
    
    it("does not publish changes if set to false", function() {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    })
  })
})

