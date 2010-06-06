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
      
      this.describe("with an async before block", function() {
        this.before(function(resume) {
          var self = this
          setTimeout(function() {
            self.value = 2
            resume()
          }, 1000);
        })
        
        this.it("waits for the before block to resume", function() {
          this.assertEqual( 2, this.value )
        })
        
        this.describe("with another nested block", function() {
          this.before(function(resume) {
            var self = this
            setTimeout(function() {
              self.value *= 4
              resume()
            }, 500)
          })
          
          this.it("runs both before blocks sequentially", function() {
            this.assertEqual( 80, this.value )
          })
        })
      })
      
      this.describe("with an async before all block", function() {
        this.before("all", function(resume) {
          var self = this
          setTimeout(function() {
            self.value = 20
            resume()
          }, 1000);
        })
        
        this.it("waits for the before all block to resume", function() {
          this.assertEqual( 2, this.value )
        })
        
        this.describe("with another nested all block", function() {
          this.before("all", function(resume) {
            var self = this
            setTimeout(function() {
              self.value *= 4
              resume()
            }, 500)
          })
          
          this.it("runs both before all blocks sequentially", function() {
            this.assertEqual( 8, this.value )
          })
        })
      })
    })
    
    JS.Test.autorun()
})

