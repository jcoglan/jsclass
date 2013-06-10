JS.ENV.PackageSpec = JS.Test.describe(JS.Package, function() { with(this) {
  include(JS.Test.Helpers)
  include(JS.Test.FakeClock)

  before(function() { this.clock.stub() })
  after(function() { this.clock.reset() })

  var PackageSpecHelper = new JS.Module({
    store: function(name) {
      this._objectNames.push(name);

      var env   = JS.ENV,
          parts = name.split('.'),
          used  = [],
          part;

      while (part = parts.shift()) {
        used.push(part);
        env = env[part];
        if (env === undefined) return this._undefined.push(used.join('.'));
      }
    },

    declare: function(name, delay, dependencies, uses) {
      this.store(name);

      var defineObject = function() {
        var env   = JS.ENV,
            parts = name.split('.'),
            part;

        while (part = parts.shift()) env = env[part] = env[part] || {};
        env.name = name;
      };

      var loaded = this._loaded;

      JS.packages(function() { with(this) {
        var block = function(callback) {
          JS.ENV.setTimeout(function() {
            defineObject(name);
            callback();
          }, delay);
          loaded.push(name);
        };

        block.toString = function() { return name };

        var pkg = loader(block);
        pkg.provides(name);
        if (dependencies) pkg.requires.apply(pkg, dependencies);
        if (uses) pkg.uses.apply(pkg, uses);
      }});
    }
  })

  include(PackageSpecHelper)

  before(function() { with(this) {
    JS.Package.onerror = this.method('addError')

    this._objectNames = []
    this._undefined   = []
    this._loaded      = []
  }})

  after(function() { with(this) {
    forEach(_objectNames, JS.Package.remove, JS.Package)
    forEach(_undefined, function(name) {
      var env   = JS.ENV,
          parts = name.split('.'),
          last  = parts.pop(),
          part;

      while (part = parts.shift()) env = env[part];
      env[last] = undefined;
    })
  }})

  describe("loading a CommonJS module", function() { with(this) {
    before(function() { with(this) {
      JS.packages(function() { with(this) {
        file(CWD + "/test/fixtures/common.js").provides("Common", "HTTP")
      }})
      stub(JS.Package.loader, "fetch", undefined)
    }})
    after(function() { JS.Package.remove("Common") })

    it("does not exist initially", function() { with(this) {
      assertEqual( "undefined", typeof Common )
    }})

    it("yields the required objects to the callback", function(resume) { with(this) {
      JS.require("Common", "HTTP", function(Common, HTTP) {
        resume(function() {
          assertEqual( "CommonJS module", Common.name )
          assertEqual( "CommonJS HTTP lib", HTTP.name )
        })
      })
    }})
  }})

  describe("loading a package for an undefined object", function() { with(this) {
    before(function() { with(this) {
      declare("Standalone", 500)
      assertEqual( "undefined", typeof Standalone )
    }})

    it("loads the object", function() { with(this) {
      JS.require("Standalone")
      clock.tick(500)
      assertKindOf( Object, Standalone )
      assertEqual( "Standalone", Standalone.name )
    }})

    it("loads the object once and runs every waiting block", function() { with(this) {
      var done1 = false, done2 = false, doneAsync = false

      JS.require("Standalone", function() { done1 = true })
      JS.require("Standalone", function() { done2 = true })

      JS.ENV.setTimeout(function() {
        JS.require("Standalone", function() { doneAsync = true })
      }, 300)

      assertEqual( "undefined", typeof Standalone )
      assert( !done1 )
      assert( !done2 )
      assert( !doneAsync )

      clock.tick(600)

      assertKindOf( Object, Standalone )
      assert( done1 )
      assert( done2 )
      assert( doneAsync )
      assertEqual( ["Standalone"], _loaded )
    }})

    describe("when the object is namespaced", function() { with(this) {
      before(function() { with(this) {
        declare("Object.In.A.Namespace", 100)
        assertEqual( undefined, Object.In )
      }})

      it("loads the object", function() { with(this) {
        JS.require("Object.In.A.Namespace")
        clock.tick(100)
        assertKindOf( Object, Object.In.A.Namespace )
      }})
    }})
  }})

  describe("loading two undefined objects", function() { with(this) {
    before(function() { with(this) {
      declare("Foo", 200)
      declare("Bar", 300)
    }})

    it("runs the block once both objects are loaded", function() { with(this) {
      assert( "undefined", typeof Foo )
      assert( "undefined", typeof Bar )

      var bothLoaded = false

      JS.require("Bar", "Foo", function() {
        bothLoaded = (typeof Foo === "object") && (typeof Foo === "object")
      })

      clock.tick(400)

      assertKindOf( Object, Foo )
      assertKindOf( Object, Bar )
      assert( bothLoaded )
      assertEqual( ["Bar", "Foo"], _loaded )
    }})
  }})

  describe("loading an object with a dependency", function() { with(this) {
    before(function() { with(this) {
      declare("Base", 100)
      declare("Dependent", 200, ["Base"])
    }})

    it("loads the packages in order when one is required", function() { with(this) {
      var done = false
      JS.require("Dependent", function() { done = true })

      assertEqual( "undefined", typeof Base )
      assertEqual( "undefined", typeof Dependent )

      clock.tick(50)

      assertEqual( ["Base"], _loaded )
      assertEqual( "undefined", typeof Base )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Base", "Dependent"], _loaded )
      assertKindOf( Object, Base )
      assertEqual( "undefined", typeof Dependent )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Base", "Dependent"], _loaded )
      assertKindOf( Object, Base )
      assertEqual( "undefined", typeof Dependent )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Base", "Dependent"], _loaded )
      assertKindOf( Object, Base )
      assertKindOf( Object, Dependent )
      assert( done )
    }})

    describe("when the dependency is already defined", function() { with(this) {
      before(function() { with(this) {
        JS.ENV.Base = {}
        assertEqual( "undefined", typeof Dependent )
      }})

      it("just loads the dependent object", function() { with(this) {
        var done = false
        JS.require("Dependent", function() { done = true })

        clock.tick(50)

        assertEqual( ["Dependent"], _loaded )
        assertEqual( "undefined", typeof Dependent )
        assert( !done )

        clock.tick(200)

        assertEqual( ["Dependent"], _loaded )
        assertKindOf( Object, Dependent )
        assert( done )
      }})
    }})

    describe("when the required object is already defined", function() { with(this) {
      before(function() { with(this) {
        JS.ENV.Dependent = {}
        assertEqual( "undefined", typeof Base )
      }})

      it("loads the dependency and waits", function() { with(this) {
        var done = false
        JS.require("Dependent", function() { done = true })

        clock.tick(50)

        assertEqual( ["Base"], _loaded )
        assertEqual( "undefined", typeof Base )
        assert( !done )

        clock.tick(100)

        assertEqual( ["Base"], _loaded )
        assertKindOf( Object, Base )
        assert( done )
      }})
    }})
  }})

  describe("loading a tree of dependencies", function() { with(this) {
    before(function() { with(this) {
      // based on JS.Class own library
      declare("Enumerable", 100)
      declare("Comparable", 100)
      declare("Hash", 300, ["Enumerable", "Comparable"])
      declare("TreeSet", 200, ["Enumerable"], ["Hash"])

      assertEqual( "undefined", typeof Enumerable )
      assertEqual( "undefined", typeof Comparable )
      assertEqual( "undefined", typeof Hash )
      assertEqual( "undefined", typeof TreeSet )
    }})

    it("loads all the objects, parallelizing where possible", function() { with(this) {
      var done = false
      JS.require("TreeSet", function() { done = true })

      clock.tick(50)

      assertEqual( ["Enumerable", "Comparable"], _loaded )
      assertEqual( "undefined", typeof Enumerable )
      assertEqual( "undefined", typeof Comparable )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Enumerable", "Comparable", "TreeSet", "Hash"], _loaded )
      assertKindOf( Object, Enumerable )
      assertKindOf( Object, Comparable )
      assertEqual( "undefined", typeof TreeSet )
      assertEqual( "undefined", typeof Hash )
      assert( !done )

      clock.tick(200)

      assertEqual( ["Enumerable", "Comparable", "TreeSet", "Hash"], _loaded )
      assertKindOf( Object, Enumerable )
      assertKindOf( Object, Comparable )
      assertKindOf( Object, TreeSet )
      assertEqual( "undefined", typeof Hash )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Enumerable", "Comparable", "TreeSet", "Hash"], _loaded )
      assertKindOf( Object, Enumerable )
      assertKindOf( Object, Comparable )
      assertKindOf( Object, TreeSet )
      assertKindOf( Object, Hash )
      assert( done )
    }})
  }})

  describe("loading an object with a soft dependency", function() { with(this) {
    before(function() { with(this) {
      declare("Helper", 500)
      declare("Application", 100, [], ["Helper"])
    }})

    it("loads the packages in parallel but waits until both are loaded", function() { with(this) {
      var done = false
      JS.require("Application", function() { done = true })

      assertEqual( "undefined", typeof Helper )
      assertEqual( "undefined", typeof Application )

      clock.tick(50)

      assertEqual( ["Helper", "Application"], _loaded )
      assertEqual( "undefined", typeof Helper )
      assertEqual( "undefined", typeof Application )
      assert( !done )

      clock.tick(100)

      assertEqual( ["Helper", "Application"], _loaded )
      assertKindOf( Object, Application )
      assertEqual( "undefined", typeof Helper )
      assert( !done )

      clock.tick(400)

      assertEqual( ["Helper", "Application"], _loaded )
      assertKindOf( Object, Helper )
      assertKindOf( Object, Application )
      assert( done )
    }})

    describe("when the required object is defined but the dependency is missing", function() { with(this) {
      before(function() { with(this) {
        JS.ENV.Application = {}
        assertEqual( "undefined", typeof Helper )
      }})

      it("loads the dependency and waits", function() { with(this) {
        var done = false
        JS.require("Application", function() { done = true })

        clock.tick(250)

        assertEqual( ["Helper"], _loaded )
        assertEqual( "undefined", typeof Helper )
        assert( !done )

        clock.tick(300)

        assertEqual( ["Helper"], _loaded )
        assertKindOf( Object, Helper )
        assert( done )
      }})
    }})

    describe("when the dependency is defined but the required is not", function() { with(this) {
      before(function() { with(this) {
        JS.ENV.Helper = {}
        assertEqual( "undefined", typeof Application )
      }})

      it("loads the required object and waits", function() { with(this) {
        var done = false
        JS.require("Application", function() { done = true })

        clock.tick(50)

        assertEqual( ["Application"], _loaded )
        assertEqual( "undefined", typeof Application )
        assert( !done )

        clock.tick(150)

        assertEqual( ["Application"], _loaded )
        assertKindOf( Object, Application )
        assert( done )
      }})
    }})
  }})

  describe("when the required object already exists", function() { with(this) {
    it("runs the block immediately without loading anything", function() { with(this) {
      var done = false
      assertKindOf( Object, JS.Test )
      JS.require("JS.Test", function() { done = true })
      assert( done )
      assertEqual( [], _loaded )
    }})
  }})
}})

