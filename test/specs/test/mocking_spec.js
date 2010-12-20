Test.MockingSpec = JS.Test.describe(JS.Test.Mocking, function() {
  describe("stub", function() {
    before(function() {
      this.object = {getName: function() { return "jester" }}
    })
    
    it("replaces a method on an object", function() {
      stub(object, "getName").returns("king")
      assertEqual( "king", object.getName() )
    })
    
    it("revokes the stub", function() {
      stub(object, "getName").returns("king")
      JS.Test.Mocking.removeStubs()
      assertEqual( "jester", object.getName() )
    })
    
    describe("with arguments", function() {
      before(function() {
        stub(object, "getName").given(1).returns("one")
        stub(object, "getName").given(2).returns("two")
        stub(object, "getName").given(1,2).returns("twelve")
        stub(object, "getName").given(1,3).returns("thirteen")
      })
      
      it("dispatches based on the arguments", function() {
        assertEqual( "one",      object.getName(1) )
        assertEqual( "two",      object.getName(2) )
        assertEqual( "twelve",   object.getName(1,2) )
        assertEqual( "thirteen", object.getName(1,3) )
      })
    })
    
    describe("yields", function() {
      before(function() {
        stub(object, "getName").yields("no", "args")
        stub(object, "getName").given("a").yields("one arg")
        stub(object, "getName").given("a", "b").yields("very", "many", "args")
      })
      
      it("returns the stubbed value using a callback", function() {
        var a, b, c, context = {}
        
        object.getName(          function() { a = JS.array(arguments) })
        object.getName("a",      function() { b = [JS.array(arguments), this] }, context)
        object.getName("a", "b", function() { c = JS.array(arguments) })
        
        assertEqual( ["no", "args"], a )
        assertEqual( [["one arg"], context], b )
        assertEqual( ["very", "many", "args"], c )
      })
    })
    
    describe("raises", function() {
      before(function() {
        this.error = new TypeError()
        stub(object, "getName").given(5,6).raises(error)
      })
      
      it("throws the given error if the arguments match", function() {
        assertThrows(TypeError, function() { object.getName(5,6) })
      })
      
      it("does not throw anything if the arguments do not match", function() {
        object.getName(5,6,7)
      })
    })
  })
})

