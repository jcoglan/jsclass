JS.ENV.ConsoleSpec = JS.Test.describe(JS.Console, function() { with(this) {
  describe("convert", function() { with(this) {
    it("strigifies undefined", function() { with(this) {
      assertEqual( "undefined", JS.Console.convert(undefined) )
    }})
    
    it("strigifies null", function() { with(this) {
      assertEqual( "null", JS.Console.convert(null) )
    }})
    
    it("strigifies booleans", function() { with(this) {
      assertEqual( "true",  JS.Console.convert(true) )
      assertEqual( "false", JS.Console.convert(false) )
    }})
    
    it("strigifies numbers", function() { with(this) {
      assertEqual( "0", JS.Console.convert(0) )
      assertEqual( "5", JS.Console.convert(5) )
    }})
    
    it("stringifies strings", function() { with(this) {
      assertEqual( '""', JS.Console.convert("") )
      assertEqual( '"hi"', JS.Console.convert("hi") )
    }})
    
    it("strigifies arrays", function() { with(this) {
      assertEqual( "[]", JS.Console.convert([]) )
      assertEqual( "[ 1, 2, 3 ]", JS.Console.convert([1,2,3]) )
    }})
    
    it("strigifies circular arrays", function() { with(this) {
      var a = [1,2]
      a.push(a)
      assertEqual( "[ 1, 2, #circular ]", JS.Console.convert(a) )
    }})
    
    it("strigifies objects", function() { with(this) {
      assertEqual( "{}", JS.Console.convert({}) )
      assertEqual( "{ \"foo\": \"bar\" }", JS.Console.convert({foo: "bar"}) )
    }})
    
    it("strigifies recursive objects", function() { with(this) {
      assertEqual( "{ \"foo\": { \"bar\": [ 1, 2, 3 ] } }", JS.Console.convert({foo: {bar: [1,2,3]}}) )
    }})
    
    it("strigifies circular objects", function() { with(this) {
      var o = {foo: "bar"}
      o.bar = o
      assertEqual( "{ \"bar\": #circular, \"foo\": \"bar\" }", JS.Console.convert(o) )
    }})
    
    it("strigifies DOM nodes", function() { with(this) {
      var node = {
        nodeType: 0,
        toString: function() { return "[object HTMLFormElement]" }
      }
      assertEqual( "[object HTMLFormElement]", JS.Console.convert(node) )
    }})
  }})
}})

