ForwardableSpec = JS.Test.describe(JS.Forwardable, function() {
  var Subject = new JS.Class({
      initialize: function() {
          this.name = "something";
      },
      setName: function(name) {
          this.name = name;
      },
      getName: function() {
          return this.name;
      },
      multiply: function(a,b) {
          return a*b;
      }
  });
  
  define("forwardableClass", function() {
    return new JS.Class({extend: JS.Forwardable,
      initialize: function() {
        this.subject = new Subject()
      }
    })
  })
  
  before(function() {
    this.forwarderClass = forwardableClass()
    this.forwarder = new forwarderClass()
  })
  
  describe("#defineDelegator", function() {
    it("defines a forwarding method", function() {
      forwarderClass.defineDelegator("subject", "getName")
      assertRespondTo( forwarder, "getName" )
      assertEqual( "something", forwarder.getName() )
    })
    
    it("passes arguments through when forwarding calls", function() {
      forwarderClass.defineDelegator("subject", "multiply")
      assertEqual( 20, forwarder.multiply(4,5) )
    })
    
    it("uses the named property as the forwarding target", function() {
      forwarder.target = {getName: function() { return "target name" }}
      forwarderClass.defineDelegator("target", "getName")
      assertEqual( "target name", forwarder.getName() )
    })
    
    it("defines a forwarding method under a different name", function() {
      forwarderClass.defineDelegator("subject", "getName", "subjectName")
      assertRespondTo( forwarder, "subjectName" )
      assertEqual( "something", forwarder.subjectName() )
    })
    
    it("defines forwarding methods for mutators", function() {
      forwarderClass.defineDelegator("subject", "getName")
      forwarderClass.defineDelegator("subject", "setName")
      forwarder.setName("nothing")
      assertEqual( "nothing", forwarder.getName() )
    })
  })
  
  describe("#defineDelegators", function() {
    it("defines multiple forwarding methods", function() {
      forwarderClass.defineDelegators("subject", "getName", "setName")
      forwarder.setName("nothing")
      assertEqual( "nothing", forwarder.getName() )
    })
  })
})

