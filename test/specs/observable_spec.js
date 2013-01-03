(function() {

var E = (typeof exports === "object"),
    Observable = (E ? JS.Package.loadFile(JSCLASS_PATH + "/observable") : JS).Observable

JS.ENV.ObservableSpec = JS.Test.describe(Observable, function() { with(this) {
  before(function() { with(this) {
    var Publisher  = new JS.Class(Observable)
    this.publisher = new Publisher()

    this.counter    = 0
    this.increment  = function() { counter++ }

    this.subscriber = {x: 0, update: function(x) { this.x += x }}
  }})

  describe("with no subscribers", function() { with(this) {
    it("does not update the counter", function() { with(this) {
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})
  }})

  describe("with a subscriber object", function() { with(this) {
    before(function() { with(this) {
      publisher.addObserver(subscriber)
    }})

    it("updates the counter", function() { with(this) {
      publisher.notifyObservers(4)
      assertEqual( 4, subscriber.x )
    }})

    it("can remove the observer", function() { with(this) {
      publisher.removeObserver(subscriber)
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    }})

    it("can remove all observers", function() { with(this) {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    }})

    it("does not publish changes if set to false", function() { with(this) {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, subscriber.x )
    }})
  }})

  describe("with a subscriber function", function() { with(this) {
    before(function() { with(this) {
      publisher.addObserver(increment)
    }})

    it("updates the counter", function() { with(this) {
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    }})

    it("can remove the observer without a context", function() { with(this) {
      publisher.removeObserver(increment)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})

    it("does not remove the observer if a different context is used", function() { with(this) {
      publisher.removeObserver(increment, {})
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    }})

    it("can remove all observers", function() { with(this) {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})

    it("does not publish changes if set to false", function() { with(this) {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})
  }})

  describe("with a subscriber function and a context", function() { with(this) {
    before(function() { with(this) {
      publisher.addObserver(increment, this)
    }})

    it("updates the counter", function() { with(this) {
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    }})

    it("cannot remove the observer without a context", function() { with(this) {
      publisher.removeObserver(increment)
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    }})

    it("does not remove the observer if a different context is used", function() { with(this) {
      publisher.removeObserver(increment, {})
      publisher.notifyObservers(4)
      assertEqual( 1, counter )
    }})

    it("removes the observer if the same context is used", function() { with(this) {
      publisher.removeObserver(increment, this)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})

    it("can remove all observers", function() { with(this) {
      publisher.removeObservers()
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})

    it("does not publish changes if set to false", function() { with(this) {
      publisher.setChanged(false)
      publisher.notifyObservers(4)
      assertEqual( 0, counter )
    }})
  }})
}})

})()

