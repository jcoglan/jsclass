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
      
      it("returns a value based on the arguments", function() {
        assertEqual( "one",      object.getName(1) )
        assertEqual( "two",      object.getName(2) )
        assertEqual( "twelve",   object.getName(1,2) )
        assertEqual( "thirteen", object.getName(1,3) )
      })
    })
  })
})

