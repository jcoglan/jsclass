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
})

