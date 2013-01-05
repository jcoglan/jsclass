PKG.require('JS.ConstantScope', function(ConstantScope) {

JS.ENV.ConstantScopeSpec = JS.Test.describe(ConstantScope, function() { with(this) {
  include(JS.Test.Helpers)

  define("createClass", function(methods) {
    methods.include = ConstantScope
    return new JS.Class(methods)
  })

  sharedBehavior("a class with lexical constant scoping", function() { with(this) {
    it("attaches the constant as a singleton property", function() { with(this) {
      assertEqual( "THE CONST", module.CONST )
    }})

    it("attaches the constant as an instance property", function() { with(this) {
      assertEqual( "THE CONST", module.prototype.CONST )
    }})

    describe("with a singleton method", function() { with(this) {
      before(function() { with(this) {
        module.extend({
          singletonMethod: function() { return this.CONST }
        })
      }})

      it("gives the method access to the constant within its scope", function() { with(this) {
        assertEqual( "THE CONST", module.singletonMethod() )
      }})
    }})

    describe("with an instance method", function() { with(this) {
      before(function() { with(this) {
        module.include({
          instanceMethod: function() { return this.CONST }
        })
      }})

      it("gives the method access to the constant within its scope", function() { with(this) {
        var instance = new module()
        assertEqual( "THE CONST", instance.instanceMethod() )
      }})
    }})
  }})

  describe("with a constant in the module body", function() { with(this) {
    before(function() { with(this) {
      this.module = createClass({ CONST: "THE CONST" })
    }})

    behavesLike("a class with lexical constant scoping")
  }})

  describe("with a constant in an extend block", function() { with(this) {
    before(function() { with(this) {
      this.module = createClass({extend: { CONST: "THE CONST" }})
    }})

    behavesLike("a class with lexical constant scoping")
  }})

  describe("with nested classes", function() { with(this) {
    before(function() { with(this) {
      this.Outer = new JS.Class('Outer', {
        include: ConstantScope,
        CONST:   45,

        Inner: new JS.Module('Inner', {
          Klass: new JS.Class({
            find: function() { return this.CONST }
          }),

          extend: {
            retrieve: function() { return this.CONST }
          }
        })
      })
    }})

    it("mixes ConstantScope into the nested classes", function() { with(this) {
      assertKindOf( JS.Class, Outer.Inner.Klass )
    }})

    it("makes constants from an outer scope visible in a nested one", function() { with(this) {
      assertEqual( 45, Outer.CONST )
      assertEqual( 45, Outer.Inner.CONST )
      assertEqual( 45, Outer.Inner.retrieve() )

      var item = new Outer.Inner.Klass()
      assertEqual( 45, item.find() )
    }})

    describe("with similarly named classes in outer and inner scopes", function() { with(this) {
      before(function() { with(this) {
        forEach([Outer.Inner, Outer], function(module) {
          module.include({
            Item: new JS.Class({ NAME: module.displayName }),

            extend: {
              getItem: function() { return this.Item }
            }
          })
        })
      }})

      it("keeps the two classes different", function() { with(this) {
        assertNotSame( Outer.Item, Outer.Inner.Item )
        assertEqual( 'Outer', Outer.Item.NAME )
        assertEqual( 'Inner', Outer.Inner.Item.NAME )

        assertKindOf( JS.Class, Outer.Item )
        assertKindOf( JS.Class, Outer.Inner.Item )
      }})

      it("locates the outer class in the outer scope", function() { with(this) {
        assertEqual( Outer.Item, Outer.getItem() )
      }})

      it("locates the inner class in the inner scope", function() { with(this) {
        assertEqual( Outer.Inner.Item, Outer.Inner.getItem() )
      }})
    }})
  }})
}})

})

