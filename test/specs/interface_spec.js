JS.ENV.InterfaceSpec = JS.Test.describe(JS.Interface, function() { with(this) {
  before(function() { with(this) {
    this.face = new JS.Interface(["foo", "bar"])
  }})
  
  describe("#test", function() { with(this) {
    it("returns true iff the object implements all the methods", function() { with(this) {
      assert( face.test({foo: function() {}, bar: function() {}}) )
    }})
    
    it("returns false iff one of the names does not map to a function", function() { with(this) {
      assert( !face.test({foo: function() {}, bar: true}) )
      assert( !face.test({foo: true, bar: function() {}}) )
    }})
    
    it("returns false iff one of the names is missing", function() { with(this) {
      assert( !face.test({foo: function() {}}) )
      assert( !face.test({bar: function() {}}) )
    }})
  }})
  
  describe(".ensure", function() { with(this) {
    it("passes iff the object implements all the methods", function() { with(this) {
      assertNothingThrown(function() {
        face.test({foo: function() {}, bar: function() {}})
      })
    }})
    
    it("throws an error iff one of the names does not map to a function", function() { with(this) {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}, bar: true}, face)
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: true, bar: function() {}}, face)
      })
    }})
    
    it("throws an error iff one of the names is missing", function() { with(this) {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}}, face)
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({bar: function() {}}, face)
      })
    }})
    
    it("throws an error iff the object does not fully implement one of the interfaces", function() { with(this) {
      assertThrows(Error, function() {
        JS.Interface.ensure({foo: function() {}}, new JS.Interface(["foo"]), new JS.Interface(["bar"]))
      })
      assertThrows(Error, function() {
        JS.Interface.ensure({bar: function() {}}, new JS.Interface(["foo"]), new JS.Interface(["bar"]))
      })
    }})
  }})
}})

