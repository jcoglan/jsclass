JS.require('JS.Console', function(Console) {

JS.ENV.ConsoleSpec = JS.Test.describe(Console, function() { with(this) {
  describe("convert", function() { with(this) {
    it("strigifies undefined", function() { with(this) {
      assertEqual( "undefined", Console.convert(undefined) )
    }})

    it("strigifies null", function() { with(this) {
      assertEqual( "null", Console.convert(null) )
    }})

    it("strigifies booleans", function() { with(this) {
      assertEqual( "true",  Console.convert(true) )
      assertEqual( "false", Console.convert(false) )
    }})

    it("strigifies numbers", function() { with(this) {
      assertEqual( "0", Console.convert(0) )
      assertEqual( "5", Console.convert(5) )
    }})

    it("stringifies strings", function() { with(this) {
      assertEqual( '""', Console.convert("") )
      assertEqual( '"hi"', Console.convert("hi") )
    }})

    it("strigifies arrays", function() { with(this) {
      assertEqual( "[]", Console.convert([]) )
      assertEqual( "[ 1, 2, 3 ]", Console.convert([1,2,3]) )
    }})

    it("strigifies circular arrays", function() { with(this) {
      var a = [1,2]
      a.push(a)
      assertEqual( "[ 1, 2, #circular ]", Console.convert(a) )
    }})

    it("strigifies objects", function() { with(this) {
      assertEqual( "{}", Console.convert({}) )
      assertEqual( "{ \"foo\": \"bar\" }", Console.convert({foo: "bar"}) )
    }})

    it("strigifies recursive objects", function() { with(this) {
      assertEqual( "{ \"foo\": { \"bar\": [ 1, 2, 3 ] } }", Console.convert({foo: {bar: [1,2,3]}}) )
    }})

    it("strigifies circular objects", function() { with(this) {
      var o = {foo: "bar"}
      o.bar = o
      assertEqual( "{ \"bar\": #circular, \"foo\": \"bar\" }", Console.convert(o) )
    }})

    it("strigifies DOM nodes", function() { with(this) {
      var node = {
        nodeType: 0,
        toString: function() { return "[object HTMLFormElement]" }
      }
      assertEqual( "[object HTMLFormElement]", Console.convert(node) )
    }})
  }})
}})

})

