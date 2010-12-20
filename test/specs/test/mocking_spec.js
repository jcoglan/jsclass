Test.MockingSpec = JS.Test.describe(JS.Test.Mocking, function() {
  describe("stub", function() {
    before(function() {
      this.object = {getName: function() { return "jester" }}
    })
    
    it("replaces a method on an object", function() {
      stub(object, "getName").andReturn("king")
      assertEqual( "king", object.getName() )
    })
    
    it("revokes the stub", function() {
      stub(object, "getName").andReturn("king")
      JS.Test.Mocking.removeStubs()
      assertEqual( "jester", object.getName() )
    })
  })
})

