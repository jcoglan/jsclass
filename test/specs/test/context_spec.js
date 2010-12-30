JS.ENV.Test = this.Test || {}

Test.ContextSpec = JS.Test.describe(JS.Test.Context, function() {
  include(JS.Test.Helpers)
  
  define("test_can_write_tests_without_context", function() {
    this.assert( true )
  })
  
  context("A new context", function() {
    context("when not nested", function() {
      before("each", function() {
        var klass = new JS.Class(JS.Test.Unit.TestCase)
        klass.include(JS.Test.Context)
        this.context = klass.context("When testing", function() {
                         define("test_this_thing", function() {
                           return true
                         })
                       })
      })
      
      it("should set the context name", function() {
        assertEqual( "When testing", context.getContextName() )
      })
      
      it("should be a Test.Unit.TestCase", function() {
        assert( JS.indexOf(context.ancestors(), JS.Test.Unit.TestCase) !== -1 )
      })
    })
    
    context("when nested", function() {
      before("each", function() {
        this.context = this.klass.context("and we're testing", function() {
          __eigen__().define("nested", function() {
            return this.context("should be nested", function() {
              define("test_this_thing", function() {
                return true
              })
            })
          })
        })
      })
      
      it("should set a nested context's name", function() {
        assertEqual( "Test.Context A new context when nested and we're testing should be nested",
                     context.nested().getContextName() )
      })
      
      it("should also be a Test.Unit.TestCase", function() {
        assert( JS.indexOf(context.nested().ancestors(), JS.Test.Unit.TestCase) !== -1 )
      })
    })
  })
  
  describe("lifecycle hooks", function() {
    extend({ hook_register: new JS.Enumerable.Collection() })
    
    before(function() {
      klass.hook_register.push("inherited_before_each")
      this.inherited_before_each_var = true
    })
    
    after(function() {
      klass.hook_register.push("inherited_after_each")
    })
    
    before("all", function() {
      klass.hook_register.clear()
      klass.hook_register.push("inherited_before_all")
      this.inherited_before_all_var = true
    })
    
    after("all", function() {
      klass.hook_register.push("inherited_after_all")
    })
    
    define("sample_test", context("lifecycle", function() {
      before(function() {
        klass.hook_register.push("before_each")
        this.before_each_var = true
      })
      
      after(function() {
        klass.hook_register.push("after_each")
      })
      
      before("all", function() {
        klass.hook_register.push("before_all")
        this.before_all_var = true
      })
      
      after("all", function() {
        klass.hook_register.push("after_all")
      })
      
      after("a_method")
      
      test("foo", function() {})
      
      test("bar", function() {})
    }))
    
    before(function() {
      klass.hook_register.push("superclass_before_each")
    })
    
    after(function() {
      klass.hook_register.push("superclass_after_each")
    })
    
    before("all", function() {
      klass.hook_register.push("superclass_before_all")
    })
    
    after("all", function() {
      klass.hook_register.push("superclass_after_all")
    })
    
    context("With before/after :each blocks", function() {
      before(function(resume) {
        this.result = new JS.Test.Unit.TestResult()
        this.suite  = sample_test.suite()
        suite.run(this.result, function() {
          this.hooks = klass.hook_register
          resume()
        }, function() {}, this)
      })
      
      it("applies state from before :all blocks to each test", function() {
        suite.forEach(function(test, resume) {
          assert( test.inherited_before_all_var )
          assert( test.before_all_var )
          resume()
        })
      })
      
      it("applies state from before :each blocks to each test", function() {
        suite.forEach(function(test, resume) {
          assert( test.inherited_before_each_var )
          assert( test.before_each_var )
          resume()
        })
      })
      
      it("runs :all blocks once per suite", function() {
        assertEqual( 1, hooks.count("inherited_before_all") )
        assertEqual( 1, hooks.count("inherited_after_all") )
        assertEqual( 1, hooks.count("superclass_before_all") )
        assertEqual( 1, hooks.count("superclass_after_all") )
        assertEqual( 1, hooks.count("before_all") )
        assertEqual( 1, hooks.count("after_all") )
      })
      
      it("runs :each blocks once per test", function() {
        assertEqual( 2, hooks.count("inherited_before_each") )
        assertEqual( 2, hooks.count("inherited_after_each") )
        assertEqual( 2, hooks.count("superclass_before_each") )
        assertEqual( 2, hooks.count("superclass_after_each") )
        assertEqual( 2, hooks.count("before_each") )
        assertEqual( 2, hooks.count("after_each") )
      })
      
      it("runs after callbacks specified with method names, instead of blocks", function() {
        assertEqual( 2, hooks.count("a method ran") )
      })
      
      it("runs before_all, then before_each, then after_each, then after_all", function() {
        assertEqual( ["inherited_before_all",   "superclass_before_all",  "before_all",
                      "inherited_before_each",  "superclass_before_each", "before_each",
                      "inherited_after_each",   "superclass_after_each",  "after_each", "a method ran",
                      "inherited_before_each",  "superclass_before_each", "before_each",
                      "inherited_after_each",   "superclass_after_each",  "after_each", "a method ran",
                      "inherited_after_all",    "superclass_after_all",   "after_all"],
                     klass.hook_register.entries() )
      })
    })
    
    define("a_method", function() { with(this) {
      klass.hook_register.push("a method ran")
    }})
    
    context("With the before option", function() {
      setup(function() {
        this.jvar = "override success!"
      })
      
      var l = function() { this.ivar = "awesome" }
      should("run the lambda", {before: l}, function() {
        assertEqual( "awesome", ivar )
      })

      var l = function() { this.jvar = "should be overridden" }
      should("run the lambda before the setup", {before: l}, function() {
        assertEqual( "override success!", jvar )
      })
    })
  })
  
  describe("nested lifecycle hooks", function() {
    before("all", function() {
      this.ivar = [0]
    })
    
    before(function() {
      this.ivar.push(1)
    })
    context("A new context", function() {
      before(function() {
        this.ivar.push(2)
      })
      
      before("all", function() {
        this.ivar.push(3)
      })
      
      context("A nested context", function() {
        before(function() {
          this.ivar.push(4)
        })
        
        before("all", function() {
          this.ivar.push(5)
        })
        
        context("A second, nested context", function() {
          before(function() {
            this.ivar.push(6)
          })
          
          before("all", function() {
            this.ivar.push(7)
          })
          
          it("should set ivar", function() {
            this.assertEqual( [0,3,5,7,1,2,4,6], this.ivar )
          })
        })
      })
    })
  })
  
  describe("shared groups", function() {
    define("test_shared_aliases", function() { with(this) {
      forEach($w("sharedBehavior shareAs shareBehaviorAs sharedExamplesFor"),
      function(methodAlias) {
        assertRespondTo( this.klass, methodAlias )
      }, this)
    }})
    
    define("test_use_aliases", function() { with(this) {
      forEach($w("uses itShouldBehaveLike behavesLike usesExamplesFrom"),
      function(methodAlias) {
        assertRespondTo( this.klass, methodAlias )
      }, this)
    }})
    
    context("A shared group", function() {
      context("creates a module", function() {
        test("based on a string name", function() {
          this.klass.shared("things and fun", function() {
          })
          
          assert( ThingsAndFun )
          assertEqual( JS.Test.Context.SharedBehavior, ThingsAndFun.klass )
        })
      })
      
      context("should be locatable", function() {
        shared("hello madam", function() {
          define("fantastic!", function() { print( "you know me!" ) })
        })
        
        it("by a string", function() {
          assertNothingThrown(function() { this.klass.use("hello madam") }, this)
        })
      
        shared("hi dog", function() {
          define("stupendous!", function() { print( "hoo hah!" ) })
        })
      
        it("by direct reference", function() {
          assertNothingThrown(function() { this.klass.use(HiDog) }, this)
        })
        
        context("across nesting hierarchies", function() {
          before(function() {
            this.klass.context("hidden", function() {
              shared("useful bits", function() {
                define("helper", function() {})
              })
            })
          })
          
          it("by a string", function() {
            assertNothingThrown(function() { this.klass.use("useful bits") }, this)
          })
        })
      })
      
      context("should include its shared behavior", function() {
        shared("Porthos", function() {
          define("parry", function() { return true })
        })
        
        it("by a string", function() {
          this.klass.use("Porthos")
          assert( parry() )
        })
        
        shared("Aramis", function() {
          define("lunge", function() { return true })
        })
        
        it("by direct reference", function() {
          this.klass.use(Aramis)
          assert( lunge() )
        })
        
        context("across nesting hierarchies", function() {
          before(function() {
            this.klass.context("hidden", function() {
              shared("useful stuff", function() {
                define("helper", function() { return true })
              })
              shared("other things", function() {
                define("handy", function() { return true })
              })
            })
          })
          
          it("by a string", function() {
            this.klass.use("useful stuff")
            assert( helper() )
          })
          
          it("only for the using context", function() {
            this.klass.context("inner", function() {
              use("other things")
            })
            assertEqual( "undefined", typeof handy )
          })
        })
      })
    })
  })
})

