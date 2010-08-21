InterfaceSpec = JS.Test.describe(JS.Interface, function() {
  before(function() {
    this.face = new JS.Interface(["foo", "bar"])
  })
  
  describe("#test", function() {
    it("returns true iff the object implements all the methods", function() {
      assert( face.test({foo: function() {}, bar: function() {}}) )
    })
    
    it("returns false iff one of the names does not map to a function", function() {
      assert( !face.test({foo: function() {}, bar: true}) )
      assert( !face.test({foo: true, bar: function() {}}) )
    })
    
    it("returns false iff one of the names is missing", function() {
      assert( !face.test({foo: function() {}}) )
      assert( !face.test({bar: function() {}}) )
    })
  })
  
  describe(".ensure", function() {
    it("passes iff the object implements all the methods", function() {
      assertNothingThrown(function() {
        face.test({foo: function() {}, bar: function() {}})
      })
    })
    
    it("throws an error iff one of the names does not map to a function", function() {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}, bar: true}, face)
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: true, bar: function() {}}, face)
      })
    })
    
    it("throws an error iff one of the names is missing", function() {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}}, face)
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({bar: function() {}}, face)
      })
    })
    
    it("throws an error iff the object does not fully implement one of the interfaces", function() {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}}, new JS.Interface(["foo"]), new JS.Interface(["bar"]))
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({bar: function() {}}, new JS.Interface(["foo"]), new JS.Interface(["bar"]))
      })
    })
  })
})

