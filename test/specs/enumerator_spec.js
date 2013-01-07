JS.require('JS.Class', 'JS.Enumerable', 'JS.Enumerator', function(Class, Enumerable, Enumerator) {

JS.ENV.EnumeratorSpec = JS.Test.describe(Enumerator, function() { with(this) {
  include(JS.Test.Helpers)

  var Dictionary = new Class("Dictionary", {
      include: Enumerable,

      initialize: function(members) {
          this._members = []
          for (var i = 0, n = members.length; i < n; i++)
              this._members.push(members[i])
      },

      forEach: function(block, context) {
          if (!block) return this.enumFor("forEach")
          var members = this._members
          for (var i = 0, n = members.length; i < n; i++)
              block.call(context, members[i])
      },

      eachWord: function(block, context) {
          if (!block) return this.enumFor("eachWord")
          this.eachWordLongerThan(0, block, context)
      },

      eachWordLongerThan: function(n, block, context) {
          if (!block) return this.enumFor("eachWordLongerThan", n)
          this.forEach(function(word) {
              if (word.length <= n) return
              var object = {}
              object[word] = word.length
              block.call(context || null, object)
          })
      }
  })

  before(function() { with(this) {
    this.items      = new Dictionary([1,2,3,4,5,6])
    this.dictionary = new Dictionary($w("some words are longer than others"))
    this.result = []
    this.push = function(x) { result.push(x) }
  }})

  describe("with no method name", function() { with(this) {
    before(function() { with(this) {
      this.iterator = new Enumerator(dictionary)
    }})

    it("is enumerable", function() { with(this) {
      assertKindOf( Enumerable, iterator )
    }})

    it("uses the #forEach method to iterate over the collection", function() { with(this) {
      iterator.forEach(push)
      assertEqual( $w("some words are longer than others"), result )
    }})
  }})

  describe("with no modifier arguments", function() { with(this) {
    before(function() { with(this) {
      this.iterator = new Enumerator(dictionary, "eachWord")
    }})

    it("is enumerable", function() { with(this) {
      assertKindOf( Enumerable, iterator )
    }})

    it("uses the named method to iterate over the collection", function() { with(this) {
      iterator.forEach(push)
      assertEqual( [{some:4}, {words:5}, {are:3}, {longer:6}, {than:4}, {others:6}], result )
    }})
  }})

  describe("with a modifier argument", function() { with(this) {
    before(function() { with(this) {
      this.iterator = new Enumerator(dictionary, "eachWordLongerThan", [4])
    }})

    it("is enumerable", function() { with(this) {
      assertKindOf( Enumerable, iterator )
    }})

    it("uses the named method and argument to iterate over the collection", function() { with(this) {
      iterator.forEach(push)
      assertEqual( [{words:5}, {longer:6}, {others:6}], result )
    }})
  }})

  it("can be used to combine Enumerable iterators", function() { with(this) {
    assertEqual( [[1,2,3],[2,3,4],[3,4,5],[4,5,6]],
                 items.forEachCons(3).entries() )
    assertEqual( [[[1,2,3],0],[[2,3,4],1],[[3,4,5],2],[[4,5,6],3]],
                 items.forEachCons(3).withIndex().
                 map(function(x,i) { return [x,i] }) )

    assertEqual( [[4,5,6],[3,4,5],[2,3,4],[1,2,3]],
                 items.forEachCons(3).reverse().entries() )

    assertEqual( [[6,5],[4,3],[2,1],[6,5],[4,3],[2,1],[6,5],[4,3],[2,1],[6,5],[4,3],[2,1]],
                 items.reverseForEach().slice(2).cycle(4).entries() )

    assertEqual( [[[6,5],0],[[4,3],1],[[2,1],2],[[6,5],3],[[4,3],4],[[2,1],5],
                  [[6,5],6],[[4,3],7],[[2,1],8],[[6,5],9],[[4,3],10],[[2,1],11]],
                 items.reverseForEach().slice(2).cycle(4).withIndex().
                 map(function(x,i) { return [x,i] }) )
  }})
}})

})

