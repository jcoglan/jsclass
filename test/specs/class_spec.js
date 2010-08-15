ClassSpec = JS.Test.describe(JS.Class, function() {
  before(function() {
    this.subjectClass = JS.Class
    this.ancestors    = [JS.Kernel]
  })
  
  behavesLike("module")
  
  it("has Module as its parent class", function() {
    assertEqual( JS.Module, JS.Class.superclass )
  })
  
  it("has no subclasses", function() {
    assertEqual( [], JS.Class.subclasses )
  })
  
  describe("with no methods", function() {
    before(function() {
      this.Class = new JS.Class()
    })
    
    it("is a class", function() {
      assert( Class.isA(JS.Class) )
      assert( Class.isA(JS.Module) )
      assert( Class.isA(JS.Kernel) )
    })
  })
  
  describe("with an instance method", function() {
    before(function() {
      this.Class = new JS.Class({
        aMethod: function() { return "instance method" }
      })
    })
    
    it("adds the method to its instances", function() {
      var instance = new Class()
      assertEqual( "instance method", instance.aMethod() )
    })
  })
  
  describe("with an #initialize method", function() {
    before(function() {
      this.Animal = new JS.Class({
        initialize: function(name, type) {
          this.name = name
          this.type = type
        },
        speak: function(thing) {
          return this.name + " likes " + thing
        }
      })
    })
    
    it("runs the #initialize method when instantiating an object", function() {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit", kermit.name )
      assertEqual( "frog",   kermit.type )
    })
    
    it("runs other methods in the correct context", function() {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit likes miss piggy", kermit.speak("miss piggy") )
    })
  })
  
  describe("#callSuper", function() {
    before(function() {
      this.Parent = new JS.Class({
        aMethod: function(thing, stuff) { return thing + ", " + stuff }
      })
    })
    
    describe("calling the superclass with implicit args", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function() { return this.callSuper() }
        })
      })
      
      it("passes args through to the parent method", function() {
        var object = new Child()
        assertEqual( "foo, bar", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling the superclass with one explicit arg", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a) { return this.callSuper(a.toUpperCase()) }
        })
      })
      
      it("passes the remaining implicit args after the explicit one", function() {
        var object = new Child()
        assertEqual( "FOO, bar", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling the superclass with explicit args", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a,b) { return this.callSuper(a.toUpperCase(), b.toUpperCase()) }
        })
      })
      
      it("passes args through to the parent method", function() {
        var object = new Child()
        assertEqual( "FOO, BAR", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling methods from mixins", function() {
      before(function() {
        this.modA = new JS.Module({ aMethod: function() { return "A" } })
        
        this.modB = new JS.Module({
          include: modA,
          aMethod: function() { return this.callSuper() + ", B" }
        })
        
        this.modC = new JS.Module({
          aMethod: function() { return this.callSuper() + ", C" }
        })
        
        this.modD = new JS.Module({
          include: modA,
          aMethod: function() { return this.callSuper() + ", D" }
        })
        
        this.classE = new JS.Class({
          include: [modB, modC, modD],
          aMethod: function() { return this.callSuper() + ", E" }
        })
      })
      
      it("uses the object's ancestry to route each super() call", function() {
        var object = new classE()
        assertEqual( "A, B, C, D, E", object.aMethod() )
      })
    })
  })
})

