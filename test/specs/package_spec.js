PackageSpec = JS.Test.describe(JS.Package, function() {
  if (typeof setTimeout === 'undefined') return
  
  include(JS.Test.Helpers)
  
  var PackageSpecHelper = new JS.Module({
    store: function(name) {
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
    },
    
    declare: function(name, delay, dependencies, uses) {
      this.store(name);
      
      var defineObject = function() {
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
  
  before(function() {
    JS.Package.onerror = this.method('processError')
    
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
  
  describe("loading a package for an undefined object", function() {
    before(function() {
      declare("Standalone", 500)
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
        declare("Object.In.A.Namespace", 100)
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
  
  describe("loading two undefined objects", function() {
    before(function() {
      declare("Foo", 200)
      declare("Bar", 300)
    })
    
    it("runs the block once both objects are loaded", function(resume) {
      assert( "undefined", typeof Foo )
      assert( "undefined", typeof Bar )
      
      var bothLoaded = false
      
      JS.require("Bar", "Foo", function() {
        bothLoaded = (typeof Foo === "object") && (typeof Foo === "object")
      })
      
      setTimeout(function() {
        resume(function() {
          assertKindOf( Object, Foo )
          assertKindOf( Object, Bar )
          assert( bothLoaded )
          assertEqual( ["Bar", "Foo"], _loaded )
        })
      }, 400)
    })
  })
  
  describe("loading an object with a dependency", function() {
    before(function() {
      declare("Base", 100)
      declare("Dependent", 200, ["Base"])
    })
    
    after(function() {
      assertEqual( "undefined", typeof Base )
      assertEqual( "undefined", typeof Dependent )
    })
    
    it("loads the packages in order when one is required", function(resume) {
      var done = false
      JS.require("Dependent", function() { done = true })
      
      assertEqual( "undefined", typeof Base )
      assertEqual( "undefined", typeof Dependent )
      
      setTimeout(function() {
        resume(function(resume) {                                     // 50ms
          assertEqual( ["Base"], _loaded )
          assertEqual( "undefined", typeof Base )
          assert( !done )
          
          setTimeout(function() {
            resume(function(resume) {                                 // 150ms
              assertEqual( ["Base", "Dependent"], _loaded )
              assertKindOf( Object, Base )
              assertEqual( "undefined", typeof Dependent )
              assert( !done )
              
              setTimeout(function() {
                resume(function(resume) {                             // 250ms
                  assertEqual( ["Base", "Dependent"], _loaded )
                  assertKindOf( Object, Base )
                  assertEqual( "undefined", typeof Dependent )
                  assert( !done )
                  
                  setTimeout(function() {                             // 350ms
                    resume(function() {
                      assertEqual( ["Base", "Dependent"], _loaded )
                      assertKindOf( Object, Base )
                      assertKindOf( Object, Dependent )
                      assert( done )
                    })
                  }, 100)
                })
              }, 100)
            })
          }, 100)
        })
      }, 50)
    })
    
    describe("when the dependency is already defined", function() {
      before(function() {
        JS.Package.ENV.Base = {}
        assertEqual( "undefined", typeof Dependent )
      })
      
      it("just loads the dependent object", function(resume) {
        var done = false
        JS.require("Dependent", function() { done = true })
        
        setTimeout(function() {
          resume(function(resume) {                                   // 50ms
            assertEqual( ["Dependent"], _loaded )
            assertEqual( "undefined", typeof Dependent )
            assert( !done )
            
            setTimeout(function() {
              resume(function() {                                     // 250ms
                assertEqual( ["Dependent"], _loaded )
                assertKindOf( Object, Dependent )
                assert( done )
              })
            }, 200)
          })
        }, 50)
      })
    })
    
    describe("when the required object is already defined", function() {
      before(function() {
        JS.Package.ENV.Dependent = {}
        assertEqual( "undefined", typeof Base )
      })
      
      it("loads the dependency and waits", function(resume) {
        var done = false
        JS.require("Dependent", function() { done = true })
        
        setTimeout(function() {
          resume(function(resume) {                                   // 50ms
            assertEqual( ["Base"], _loaded )
            assertEqual( "undefined", typeof Base )
            assert( !done )
            
            setTimeout(function() {
              resume(function() {                                     // 150ms
                assertEqual( ["Base"], _loaded )
                assertKindOf( Object, Base )
                assert( done )
              })
            }, 100)
          })
        }, 50)
      })
    })
  })
  
  describe("loading a tree of dependencies", function() {
    before(function() {
      // based on JS.Class own library
      declare("Enumerable", 100)
      declare("Comparable", 100)
      declare("Hash", 300, ["Enumerable", "Comparable"])
      declare("Set", 200, ["Enumerable"], ["Hash"])
      
      assertEqual( "undefined", typeof Enumerable )
      assertEqual( "undefined", typeof Comparable )
      assertEqual( "undefined", typeof Hash )
      assertEqual( "undefined", typeof Set )
    })
    
    it("loads all the objects, parallelizing where possible", function(resume) {
      var done = false
      JS.require("Set", function() { done = true })
      
      setTimeout(function() {
        resume(function(resume) {                                     // 50ms
          assertEqual( ["Enumerable", "Comparable"], _loaded )
          assertEqual( "undefined", typeof Enumerable )
          assertEqual( "undefined", typeof Comparable )
          assert( !done )
          
          setTimeout(function() {
            resume(function(resume) {                                 // 150ms
              assertEqual( ["Enumerable", "Comparable", "Set", "Hash"], _loaded )
              assertKindOf( Object, Enumerable )
              assertKindOf( Object, Comparable )
              assertEqual( "undefined", typeof Set )
              assertEqual( "undefined", typeof Hash )
              assert( !done )
              
              setTimeout(function() {
                resume(function(resume) {                             // 350ms
                  assertEqual( ["Enumerable", "Comparable", "Set", "Hash"], _loaded )
                  assertKindOf( Object, Enumerable )
                  assertKindOf( Object, Comparable )
                  assertKindOf( Object, Set )
                  assertEqual( "undefined", typeof Hash )
                  assert( !done )
                  
                  setTimeout(function() {
                    resume(function() {                               // 450ms
                      assertEqual( ["Enumerable", "Comparable", "Set", "Hash"], _loaded )
                      assertKindOf( Object, Enumerable )
                      assertKindOf( Object, Comparable )
                      assertKindOf( Object, Set )
                      assertKindOf( Object, Hash )
                      assert( done )
                    })
                  }, 100)
                })
              }, 200)
            })
          }, 100)
        })
      }, 50)
    })
  })
  
  describe("loading an object with a soft dependency", function() {
    before(function() {
      declare("Helper", 500)
      declare("Application", 100, [], ["Helper"])
    })
    
    it("loads the packages in parallel but waits until both are loaded", function(resume) {
      var done = false
      JS.require("Application", function() { done = true })
      
      assertEqual( "undefined", typeof Helper )
      assertEqual( "undefined", typeof Application )
      
      setTimeout(function() {
        resume(function(resume) {                                     // 50ms
          assertEqual( ["Helper", "Application"], _loaded )
          assertEqual( "undefined", typeof Helper )
          assertEqual( "undefined", typeof Application )
          assert( !done )
          
          setTimeout(function() {
            resume(function(resume) {                                 // 150ms
              assertEqual( ["Helper", "Application"], _loaded )
              assertKindOf( Object, Application )
              assertEqual( "undefined", typeof Helper )
              assert( !done )
              
              setTimeout(function() {
                resume(function() {                                   // 550ms
                  assertEqual( ["Helper", "Application"], _loaded )
                  assertKindOf( Object, Helper )
                  assertKindOf( Object, Application )
                  assert( done )
                })
              }, 400)
            })
          }, 100)
        })
      }, 50)
    })
    
    describe("when the required object is defined but the dependency is missing", function() {
      before(function() {
        JS.Package.ENV.Application = {}
        assertEqual( "undefined", typeof Helper )
      })
      
      it("loads the dependency and waits", function(resume) {
        var done = false
        JS.require("Application", function() { done = true })
        
        setTimeout(function() {
          resume(function(resume) {
            assertEqual( ["Helper"], _loaded )
            assertEqual( "undefined", typeof Helper )
            assert( !done )
            
            setTimeout(function() {
              resume(function() {
                assertEqual( ["Helper"], _loaded )
                assertKindOf( Object, Helper )
                assert( done )
              })
            }, 300)
          })
        }, 250)
      })
    })
    
    describe("when the dependency is defined but the required is not", function() {
      before(function() {
        JS.Package.ENV.Helper = {}
        assertEqual( "undefined", typeof Application )
      })
      
      it("loads the required object and waits", function(resume) {
        var done = false
        JS.require("Application", function() { done = true })
        
        setTimeout(function() {
          resume(function(resume) {
            assertEqual( ["Application"], _loaded )
            assertEqual( "undefined", typeof Application )
            assert( !done )
            
            setTimeout(function() {
              resume(function() {
                assertEqual( ["Application"], _loaded )
                assertKindOf( Object, Application )
                assert( done )
              })
            }, 150)
          })
        }, 50)
      })
    })
  })
  
  describe("when the required object already exists", function() {
    it("runs the block immediately without loading anything", function() {
      var done = false
      assertKindOf( Object, JS.Test )
      JS.require("JS.Test", function() { done = true })
      assert( done )
      assertEqual( [], _loaded )
    })
  })
})

