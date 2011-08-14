JS.ENV.ConsoleSpec = JS.Test.describe(JS.Console, function() { with(this) {
  describe("convert", function() { with(this) {
    it("strigifies numbers", function() { with(this) {
      assertEqual( "5", JS.Console.convert(5) )
    }})
    
    it("strigifies arrays", function() { with(this) {
      assertEqual( "[ 1, 2, 3 ]", JS.Console.convert([1,2,3]) )
    }})
    
    it("strigifies circular arrays", function() { with(this) {
      var a = [1,2]
      a.push(a)
      assertEqual( "[ 1, 2, #circular ]", JS.Console.convert(a) )
    }})
    
    it("strigifies objects", function() { with(this) {
      assertEqual( "{ \"foo\": \"bar\" }", JS.Console.convert({foo: "bar"}) )
    }})
    
    it("strigifies circular objects", function() { with(this) {
      var o = {foo: "bar"}
      o.bar = o
      assertEqual( "{ \"bar\": #circular, \"foo\": \"bar\" }", JS.Console.convert(o) )
    }})
  }})
}})

