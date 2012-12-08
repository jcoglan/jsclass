JS.ENV.MethodSpec = JS.Test.describe(JS.Method, function() { with(this) {
  before(function() { with(this) {
    this.callable  = function(a,b) { return "something" }
    this.theModule = new JS.Module({ im_a_method: callable })
    this.theMethod = theModule.instanceMethod("im_a_method")
  }})

  it("should be bootstrapped properly", function() { with(this) {
    assertKindOf( JS.Class,  JS.Method )
    assertKindOf( JS.Module, JS.Method )
    assertKindOf( JS.Kernel, JS.Method )
    assertEqual( "Method", JS.Method.displayName )
  }})

  describe("#module", function() { with(this) {
    it("refers to the module hosting the method", function() { with(this) {
      assertEqual( theModule, theMethod.module )
    }})
  }})

  describe("#name", function() { with(this) {
    it("returns the name of the method", function() { with(this) {
      assertEqual( "im_a_method", theMethod.name )
    }})
  }})

  describe("#callable", function() { with(this) {
    it("refers to the JavaScript function the method represents", function() { with(this) {
      assertEqual( callable, theMethod.callable )
    }})
  }})

  describe("#arity", function() { with(this) {
    it("gives the number of arguments the method accepts", function() { with(this) {
      assertEqual( 2, theMethod.arity )
    }})
  }})

  describe("#contains", function() { with(this) {
    it("returns true if the method's source includes the word", function() { with(this) {
      assert( theMethod.contains("return") )
      assert( theMethod.contains("something") )
    }})

    it("returns false if the method's source does not include the word", function() { with(this) {
      assert( !theMethod.contains("nothing") )
    }})
  }})
}})

