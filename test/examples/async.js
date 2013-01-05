JSCLASS_PATH = "build/min/"
var JS = require("../../" + JSCLASS_PATH + "loader")

JS.require("JS.Test", "JS.MethodChain", function(Test, MC) {

  Test.describe("Asynchronous testing", function() { with(this) {
    describe("with a simple test", function() { with(this) {
      it("allows async assertions", function(resume) { with(this) {
        setTimeout(function() {
          resume(function() { assert(false) })
        }, 1000)
      }})
    }})

    describe("with nested resume blocks", function() { with(this) {
      define("wait", function(resume, block) { with(this) {
        setTimeout(function() { resume(block) }, 1000)
      }})

      it("keeps running until you use a resume block with no continuation", function(resume) { with(this) {
        var startTime = new Date().getTime();

        wait(resume, function(resume) {
          assert(true)
          wait(resume, function(resume) {
            assert(true)
            wait(resume, function() {
              var endTime = new Date().getTime();
              assertInDelta( 4, endTime - startTime, 0.1 )
            })
          })
        })
      }})
    }})

    describe("with an async before block", function() { with(this) {
      before(function(resume) { with(this) {
        var self = this
        setTimeout(function() {
          self.value = 2
          resume()
        }, 1000);
      }})

      it("waits for the before block to resume", function() { with(this) {
        assertEqual( 2, value )
      }})

      describe("with another nested block", function() { with(this) {
        before(function(resume) { with(this) {
          var self = this
          setTimeout(function() {
            self.value *= 4
            resume()
          }, 500)
        }})

        it("runs both before blocks sequentially", function() { with(this) {
          assertEqual( 80, this.value )
        }})
      }})
    }})

    describe("with an async before all block", function() { with(this) {
      before("all", function(resume) { with(this) {
        var self = this
        setTimeout(function() {
          self.value = 20
          resume()
        }, 1000);
      }})

      it("waits for the before all block to resume", function() { with(this) {
        assertEqual( 2, value )
      }})

      describe("with another nested all block", function() { with(this) {
        before("all", function(resume) { with(this) {
          var self = this
          setTimeout(function() {
            self.value *= 4
            resume()
          }, 500)
        }})

        it("runs both before all blocks sequentially", function() { with(this) {
          assertEqual( 8, value )
        }})
      }})
    }})
  }})

  Test.autorun()
})

