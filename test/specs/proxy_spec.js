ProxySpec = JS.Test.describe(JS.Proxy, function() {
  describe(JS.Proxy.Virtual, function() {
    before(function() {
      this.instances = 0
      
      this.Subject = new JS.Class({
        initialize: function(name, age) {
          instances += 1
          this.name = name
          this.age  = age
        },
        
        setName: function(a, b) {
          this.name = a + " " + b
        },
        
        getName: function() { return this.name },
        
        getAge:  function() { return this.age  }
      })
      
      this.Proxy = new JS.Proxy.Virtual(Subject)
      this.proxyInstance = new Proxy("jcoglan", 26)
    })
    
    it("creates classes", function() {
      assertKindOf( JS.Class, Proxy )
    })
    
    it("does not instantiate the wrapped class immediately", function() {
      assertEqual( 0, instances )
    })
    
    it("instantiates the wrapped class when a method is called", function() {
      proxyInstance.getName()
      assertEqual( 1, instances )
    })
    
    it("instantiates the wrapped class once per proxy instance", function() {
      proxyInstance.getName()
      proxyInstance.getName()
      assertEqual( 1, instances )
      new Proxy("bart", 10).getName()
      assertEqual( 2, instances )
    })
    
    it("passes constructor arguments down to the subject", function() {
      assertEqual( "jcoglan", proxyInstance.getName() )
      assertEqual( 26, proxyInstance.getAge() )
    })
    
    it("passes method arguments down to the subject", function() {
      proxyInstance.setName("some", "words")
      assertEqual( "some words", proxyInstance.getName() )
    })
    
    describe("a singleton method", function() {
      before(function() {
        proxyInstance.extend({
          newMethod: function() { return this.name.toUpperCase() }
        })
      })
      
      it("can access the subject's instance variables", function() {
        assertEqual( "JCOGLAN", proxyInstance.newMethod() )
      })
    })
    
    describe("a singleton method that calls super", function() {
      before(function() {
        proxyInstance.extend({
          getAge: function() { return this.callSuper() * 2 }
        })
      })
      
      it("calls the subject's implementation of the method", function() {
        assertEqual( 52, proxyInstance.getAge() )
      })
    })
  })
})

