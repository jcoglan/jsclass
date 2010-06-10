MethodChainSpec = JS.Test.describe(JS.MethodChain, function() {
  include(JS.Test.Helpers)
  
  define("Widget", new JS.Class({
      initialize: function(name) {
          this.name = name;
      },
      methodNameWeHaveProbablyNotSeenBefore: function() {
          return this.name.toLowerCase();
      }
  }))
      
  before(function() {
    this.list  = ["food", "bar"]
    list.call  = function() { this.called = true }
    this.langs = ["ruby", "javascript", "scheme"]
    this.chain = new JS.MethodChain(list)
  })
  
  describe("method call", function() {
    it("returns the chain object", function() {
      assertSame( chain, chain.sort() )
    })
    
    it("recognises methods added to custom classes", function() {
      assertSame( chain, chain.methodNameWeHaveProbablyNotSeenBefore() )
    })
  })
  
  describe("#__exec__", function() {
    describe("with no stored calls", function() {
      it("returns its base object unmodified", function() {
        assertEqual( list, chain.__exec__() )
      })
      
      it("returns the exec argument if given", function() {
        assertEqual( langs, chain.__exec__(langs) )
      })
    })
    
    describe("with one stored property accessor", function() {
      before(function() {
        chain.length()
      })
      
      it("gets the named property from the argument", function() {
        assertEqual( 2, chain.__exec__() )
        assertEqual( 3, chain.__exec__(langs) )
      })
    })
    
    describe("with one stored method call", function() {
      before(function() {
        chain.sort()
      })
      
      it("calls the stored method on the argument", function() {
        assertEqual( ["bar", "food"], chain.__exec__() )
        assertEqual( ["javascript", "ruby", "scheme"], chain.__exec__(langs) )
      })
      
      it("recognises methods added to custom classes", function() {
        var chain = new JS.MethodChain()
        chain.methodNameWeHaveProbablyNotSeenBefore()
        assertEqual( "nick", chain.__exec__(new Widget("Nick")) )
      })
    })
    
    describe("with one stored method with an argument", function() {
      before(function() {
        chain.sort(function(a,b) { return a.length - b.length })
      })
      
      it("calls the stored method with the stored argument", function() {
        assertEqual( ["bar", "food"], chain.__exec__() )
        assertEqual( ["ruby", "scheme", "javascript"], chain.__exec__(langs) )
      })
    })
    
    describe("with a chain of stored methods", function() {
      before(function() {
        this.string = "something else"
        this.chain  = new JS.MethodChain(string)
        chain.toUpperCase().replace(/[aeiou]/ig, "_")
      })
      
      it("executes the stored methods as a chain", function() {
        assertEqual( "S_M_TH_NG _LS_", chain.__exec__() )
      })
    })
  })
  
  describe("#_", function() {
    describe("in MethodChain", function() {
      describe("with an object", function() {
        it("changes the base object for the rest of the chain", function() {
          chain._(["another", "list"]).sort()
          assertEqual( ["another", "list"], chain.__exec__() )
        })
        
        it("does not stop previous calls going to the old base object", function() {
          chain.call()._(["another", "list"]).sort()
          assert( !list.called )
          chain.__exec__()
          assert( list.called )
        })
      })
      
      describe("with a function", function() {
        it("adds a function to the chain", function() {
          chain._(function() { return this.slice(1) })
          assertEqual( ["bar"], chain.__exec__() )
        })
        
        it("adds a function with arguments to the chain", function() {
          chain._(function(method, arg) { return this[method](arg) }, "slice", 1)
          assertEqual( ["bar"], chain.__exec__() )
        })
        
        it("uses the return value as the new base object", function() {
          chain._(function() { return "word" }).toUpperCase()
          assertEqual( "WORD", chain.__exec__() )
        })
      })
    })
    
    describe("in Kernel", function() {
      before(function() {
        this.widget = new Widget("Nick")
      })
      
      it("returns the object given to it", function() {
        assertSame( list, widget._(list) )
      })
      
      it("applies a function to the receiver", function() {
        assertEqual( "Nick", widget._(function() { return this.name }) )
      })
      
      it("applies a function with arguments to the receiver", function() {
        assertEqual( "Nick and David", widget._(function(name) { return this.name + " and " + name }, "David") )
      })
    })
  })
  
  describe("#toFunction", function() {
    it("returns a function that executes the chain against the argument", function() {
      var func = chain.sort().toFunction()
      assertEqual( $w("ordered some words"), func($w("some ordered words")) )
    })
  })
})

