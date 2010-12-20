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
    
    describe("with a matcher argument", function() {
      before(function() {
        stub(object, "getName").given(arrayIncluding("foo")).returns(true)
        stub(object, "getName").given(arrayIncluding("bar", "qux")).returns(true)
        stub(object, "getName").given(arrayIncluding("bar")).returns(false)
      })
      
      it("dispatches to the pattern that matches the input", function() {
        assert( object.getName(["something", "foo", "else"]) )
        assert( !object.getName(["these", "words", "bar"]) )
        assert( object.getName(["qux", "words", "bar"]) )
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
    
    describe("matchers", function() {
      describe("a", function() {
        it("matches instances of the given type", function() {
          assertEqual( a(JS.Set), new JS.SortedSet() )
          assertEqual( a(JS.Enumerable), new JS.Hash() )
          assertEqual( a(String), "hi" )
          assertEqual( a("string"), "hi" )
          assertEqual( a(Number), 9 )
          assertEqual( a("number"), 9 )
          assertEqual( a(Boolean), false )
          assertEqual( a("boolean"), true )
          assertEqual( an(Array), [] )
          assertEqual( an("object"), {} )
          assertEqual( a("function"), function() {} )
          assertEqual( a(Function), function() {} )
        })
        
        it("does not match instances of other types", function() {
          assertNotEqual( an("object"), 9 )
          assertNotEqual( a(JS.Comparable), new JS.Set )
          assertNotEqual( a(JS.SortedSet), new JS.Set )
          assertNotEqual( a(Function), "string" )
          assertNotEqual( an(Array), {} )
        })
      })
      
      describe("match", function() {
        it("matches objects the match the type", function() {
          assertEqual( match(/foo/), "foo" )
          assertEqual( match(JS.Enumerable), new JS.Set() )
        })
        
        it("does not match objects that don't match the type", function() {
          assertNotEqual( match(/foo/), "bar" )
          assertNotEqual( match(JS.Enumerable), new JS.Class() )
        })
      })
      
      describe("arrayIncluding", function() {
        it("matches an array containing all the required elements", function() {
          assertEqual( arrayIncluding("foo"), ["hi", "foo", "there"] )
          assertEqual( arrayIncluding(), ["hi", "foo", "there"] )
          assertEqual( arrayIncluding("foo", "bar"), ["bar", "hi", "foo", "there"] )
        })
        
        it("does not match other data types", function() {
          assertNotEqual( arrayIncluding("foo"), {foo: true} )
          assertNotEqual( arrayIncluding("foo"), true )
          assertNotEqual( arrayIncluding("foo"), "foo" )
          assertNotEqual( arrayIncluding("foo"), null )
          assertNotEqual( arrayIncluding("foo"), undefined )
        })
        
        it("does not match arrays that don't contain all the required elements", function() {
          assertNotEqual( arrayIncluding("foo", "bar"), ["hi", "foo", "there"] )
          assertNotEqual( arrayIncluding("foo", "bar"), ["bar", "hi", "there"] )
        })
      })
      
      describe("objectIncluding", function() {
        it("matches an object containing all the required pairs", function() {
          assertEqual( objectIncluding({foo: true}), {hi: true, foo: true, there: true} )
          assertEqual( objectIncluding(), {hi: true, foo: true, there: true} )
          assertEqual( objectIncluding({bar: true, foo: true}), {bar: true, hi: true, foo: true, there: true} )
        })
        
        it("does not match other data types", function() {
          assertNotEqual( objectIncluding({foo: true}), ["foo"] )
          assertNotEqual( objectIncluding({foo: true}), true )
          assertNotEqual( objectIncluding({foo: true}), "foo" )
          assertNotEqual( objectIncluding({foo: true}), null )
          assertNotEqual( objectIncluding({foo: true}), undefined )
        })
        
        it("does not match objects that don't contain all the required pairs", function() {
          assertNotEqual( objectIncluding({bar: true, foo: true}), {bar: false, hi: true, foo: true, there: true} )
          assertNotEqual( objectIncluding({bar: true, foo: true}), {bar: true, hi: true, there: true} )
        })
      })
    })
  })
})

