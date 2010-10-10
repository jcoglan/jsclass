MethodSpec = JS.Test.describe(JS.Method, function() {
  before(function() {
    this.callable  = function(a,b) { return "something" }
    this.theModule = new JS.Module({ im_a_method: callable })
    this.theMethod = theModule.instanceMethod("im_a_method")
  })
  
  it("should be bootstrapped properly", function() {
    assertKindOf( JS.Class,  JS.Method )
    assertKindOf( JS.Module, JS.Method )
    assertKindOf( JS.Kernel, JS.Method )
    assertEqual( "Method", JS.Method.displayName )
  })
  
  describe("#module", function() {
    it("refers to the module hosting the method", function() {
      assertEqual( theModule, theMethod.module )
    })
  })
  
  describe("#name", function() {
    it("returns the name of the method", function() {
      assertEqual( "im_a_method", theMethod.name )
    })
  })
  
  describe("#callable", function() {
    it("refers to the JavaScript function the method represents", function() {
      assertEqual( callable, theMethod.callable )
    })
  })
  
  describe("#arity", function() {
    it("gives the number of arguments the method accepts", function() {
      assertEqual( 2, theMethod.arity )
    })
  })
  
  describe("#contains", function() {
    it("returns true if the method's source includes the word", function() {
      assert( theMethod.contains("return") )
      assert( theMethod.contains("something") )
    })
    
    it("returns false if the method's source does not include the word", function() {
      assert( !theMethod.contains("nothing") )
    })
  })
})

