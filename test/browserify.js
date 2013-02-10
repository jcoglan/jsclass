var Test = require('./test').Test

Test.describe("a thing", function() { with(this) {
  it("works", function() { with(this) {
    assertEqual( 4, 2 + 2 )
  }})
}})

Test.autorun()

