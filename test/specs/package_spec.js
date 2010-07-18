PackageSpec = JS.Test.describe(JS.Package, function() {
  if (typeof setTimeout === 'undefined') return
  
  include(JS.Test.Helpers)
  
  before(function() {
    this._objectNames = []
    this._undefined   = []
    this._loaded      = []
  })
  
  after(function() {
    forEach(_objectNames, JS.Package.remove, JS.Package)
    forEach(_undefined, function(name) {
      var env   = JS.Package.ENV,
          parts = name.split('.'),
          last  = parts.pop(),
          part;
      
      while (part = parts.shift()) env = env[part];
      delete env[last];
    })
  })
  
  define("store", function(names) {
    this.forEach(names, function(name) {
      this._objectNames.push(name);
      
      var env   = JS.Package.ENV,
          parts = name.split('.'),
          used  = [],
          part;
      
      while (part = parts.shift()) {
        used.push(part);
        env = env[part];
        if (env === undefined) return this._undefined.push(used.join('.'));
      }
    }, this);
  })
  
  define("declare", function(names, delay) {
    this.store(names);
    
    var defineObject = function(name) {
      var env   = JS.Package.ENV,
          parts = name.split('.'),
          part;
      
      while (part = parts.shift()) env = env[part] = env[part] || {};
      env.name = name;
    };
    
    var loaded = this._loaded;
    
    JS.Packages(function() { with(this) {
      var block = function(callback) {
        setTimeout(function() {
          for (var i = 0, n = names.length; i < n; i++) {
            defineObject(names[i]);
            loaded.push(names[i]);
          }
          callback();
        }, delay);
      };
      
      block.toString = function() { return names.join(':') };
      
      var pkg = loader(block);
      pkg.provides.apply(pkg, names);
    }});
  })
  
  describe("loading a package for an undefined object", function() {
    before(function() {
      declare(["Standalone"], 500)
      assertEqual( "undefined", typeof Standalone )
    })
    
    it("loads the object", function(resume) {
      JS.require("Standalone", function() {
        resume(function() {
          assertKindOf( Object, Standalone )
          assertEqual( "Standalone", Standalone.name )
        })
      })
    })
    
    it("loads the object once and runs every waiting block", function(resume) {
      var done1 = false, done2 = false, doneAsync = false
      
      JS.require("Standalone", function() { done1 = true })
      JS.require("Standalone", function() { done2 = true })
      
      setTimeout(function() {
        JS.require("Standalone", function() { doneAsync = true })
      }, 300)
      
      assertEqual( "undefined", typeof Standalone )
      assert( !done1 )
      assert( !done2 )
      assert( !doneAsync )
      
      setTimeout(function() {
        resume(function() {
          assertKindOf( Object, Standalone )
          assert( done1 )
          assert( done2 )
          assert( doneAsync )
          assertEqual( ["Standalone"], _loaded )
        })
      }, 600)
    })
    
    describe("when the object is namespaced", function() {
      before(function() {
        declare(["Object.In.A.Namespace"], 100)
        assertEqual( undefined, Object.In )
      })
      
      after(function() {
        assertEqual( undefined, Object.In )
      })
      
      it("loads the object", function(resume) {
        JS.require("Object.In.A.Namespace", function() {
          resume(function() {
            assertKindOf( Object, Object.In.A.Namespace )
          })
        })
      })
    })
  })
})

