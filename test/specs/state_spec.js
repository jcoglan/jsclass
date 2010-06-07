StateSpec = JS.Test.describe(JS.State, function() { with(this) {
  var Positive = {
    ping: function() { this.value += 1 }
  }

  var Adjustable = {
    ping: function(a,b) { this.value += a+b }
  }

  before(function() { with(this) {
    this.Stateful = new JS.Class({
      include: JS.State,
      initialize: function() { this.value = 0 }
    })
  }})

  describe("with no initial state", function() { with(this) {
    before(function() { with(this) {
      this.subject = new Stateful()
    }})

    it("does not inherit the stateful method", function() { with(this) {
      assertThrows( TypeError, function() { subject.ping() })
    }})

    it("is not in any state", function() { with(this) {
      assert( !subject.inState(Positive) )
      assert( !subject.inState(Adjustable) )
    }})

    it("gains the stateful method when a state is set", function() { with(this) {
      subject.setState(Positive)
      assertRespondTo( subject, "ping" )
    }})
  }})

  describe("with a positive initial state", function() { with(this) {
    before(function() { with(this) {
      Stateful.include({
        initialize: function() {
          this.value = 0
          this.setState(Positive)
        }
      })
      this.subject = new Stateful()
      assertEqual( 0, subject.value )
    }})

    it("is in the positive state", function() { with(this) {
      assert( subject.inState(Positive) )
    }})

    it("is not in the adjustable state", function() { with(this) {
      assert( !subject.inState(Adjustable) )
    }})

    it("gets the stateful method on initialization", function() { with(this) {
      assertRespondTo( subject, "ping" )
    }})

    it("uses the state's implementation of the method", function() { with(this) {
      subject.ping()
      assertEqual( 1, subject.value )
    }})

    describe("after switching state", function() { with(this) {
      before(function() { with(this) {
        subject.setState(Adjustable)
      }})

      it("is in the new state", function() { with(this) {
        assert( !subject.inState(Positive) )
        assert( subject.inState(Adjustable) )
      }})

      it("uses the new state's implementation of the method", function() { with(this) {
        subject.ping(3,7)
        assertEqual( 10, subject.value )
      }})
    }})
  }})

  describe("with inline states", function() { with(this) {
    before(function() { with(this) {
      Stateful.include({
        states: {
          MIKE: {
            isCalled: function(name) { return this.name === name },
            setName: function() { this.name = "mike" }
          },
          BOB: {
            setName: function(name) { this.name = name }
          }
        }
      })
    }})

    describe("with no initial state", function() { with(this) {
      before(function() { with(this) {
        this.subject = new Stateful()
      }})

      it("inherits the inline stateful methods", function() { with(this) {
        assertRespondTo( subject, "setName" )
        assertRespondTo( subject, "isCalled" )
      }})

      it("is not in any state", function() { with(this) {
        assert( !subject.inState("MIKE") )
        assert( !subject.inState("BOB") )
      }})

      it("responds to the stateful methods with a no-op", function() { with(this) {
        assertEqual( subject, subject.isCalled("mike") )
        subject.setName("cooper")
        assertEqual( undefined, subject.name )
      }})
    }})

    describe("with an initial state", function() { with(this) {
      before(function() { with(this) {
        Stateful.include({
          initialize: function() {
            this.setState("MIKE")
          }
        })
        this.subject = new Stateful()
      }})

      it("is in the correct state", function() { with(this) {
        assert( subject.inState("MIKE") )
        assert( !subject.inState("BOB") )
      }})

      it("uses the state's implementation of the methods", function() { with(this) {
        assertEqual( undefined, subject.name )
        subject.setName("something")
        assertEqual( "mike", subject.name )
        assert( subject.isCalled("mike") )
        assert( !subject.isCalled("something") )
      }})

      describe("after changing state", function() { with(this) {
        before(function() { with(this) {
          subject.setState("BOB")
        }})

        it("is in the new state", function() { with(this) {
          assert( subject.inState("BOB") )
          assert( !subject.inState("MIKE") )
        }})

        it("uses the new state's implementation of the methods", function() { with(this) {
          assertEqual( undefined, subject.name )
          subject.setName("something")
          assertEqual( "something", subject.name )
          assertEqual( subject, subject.isCalled("mike") )
        }})
      }})
    }})
  }})
}})

