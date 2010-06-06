JSCLASS_PATH = "build/min/"
require("../" + JSCLASS_PATH + "loader")

JS.require("JS.Test", "JS.MethodChain", function() {
    
    JS.Test.describe("Asynchronous testing", function() {
      
      this.describe("with a simple test", function() {
        this.it("allows async assertions", function(resume) {
          setTimeout(function() {
            resume(function() { this.assert(false) })
          }, 1000)
        })
      })
      
      this.describe("with nested resume blocks", function() {
        this.define("wait", function(resume, block) {
          setTimeout(function() { resume(block) }, 1000)
        })
        
        this.it("keeps running until you use a resume block with no continuation",
        function(resume) { with(this) {
          var startTime = new Date().getTime();
          
          wait(resume, function(resume) {
            assert(true)
            wait(resume, function(resume) {
              assert(true)
              wait(resume, function() {
                var endTime = new Date().getTime();
                this.assertInDelta( 4, endTime - startTime, 0.1 )
              })
            })
          })
        }})
      })
    })
    
    JS.Test.autorun()
})

