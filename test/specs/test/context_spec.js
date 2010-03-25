Test = this.Test || {}

Test.ContextSpec = JS.Test.describe(JS.Test.Context, function() { with(this) {
  include(JS.Test.Helpers)
  
  def("test_can_write_tests_without_context", function() {
    this.assert( true )
  })
  
  context("A new context", function() { with(this) {
    context("when not nested", function() { with(this) {
      before("each", function() {
        var klass = new JS.Class(JS.Test.Unit.TestCase)
        klass.include(JS.Test.Context)
        this.context = klass.context("When testing", function() { with(this) {
                         def("test_this_thing", function() {
                           return true
                         })
                       }})
      })
      
      it("should set the context name", function() { with(this) {
        assertEqual( "When testing", context.getContextName() )
      }})
      
      it("should be a Test.Unit.TestCase", function() { with(this) {
        assert( JS.indexOf(context.ancestors(), JS.Test.Unit.TestCase) !== -1 )
      }})
    }})
    
    context("when nested", function() { with(this) {
      before("each", function() { with(this) {
        this.context = this.klass.context("and we're testing", function() { with(this) {
          self.def("nested", function() {
            return this.context("should be nested", function() { with(this) {
              def("test_this_thing", function() {
                return true
              })
            }})
          })
        }})
      }})
      
      it("should set a nested context's name", function() { with(this) {
        assertEqual( "Test.Context A new context when nested and we're testing should be nested",
                     context.nested().getContextName() )
      }})
      
      it("should also be a Test.Unit.TestCase", function() { with(this) {
        assert( JS.indexOf(context.nested().ancestors(), JS.Test.Unit.TestCase) !== -1 )
      }})
    }})
  }})
  
  describe("lifecycle hooks", function() { with(this) {
    before(function() { with(this) {
      this.inherited_before_each_var = this.inherited_before_each_var || 0
      this.inherited_before_each_var += 1
    }})
    
    before(function() { with(this) {
      this.inherited_before_each_var = this.inherited_before_each_var || 0
      this.inherited_before_each_var_2 = this.inherited_before_each_var_2 || 0
      this.inherited_before_each_var += 2
      this.inherited_before_each_var_2 += 1
    }})
    
    after(function() { with(this) {
      this.inherited_after_each_var = this.inherited_after_each_var || 0
      this.inherited_after_each_var += 1
    }})
    
    before("all", function() { with(this) {
      this.inherited_before_all_var = this.inherited_before_all_var || 0
      this.inherited_before_all_var += 1
    }})
    
    after("all", function() { with(this) {
      this.inherited_after_all_var = this.inherited_after_all_var || 0
      this.inherited_after_all_var += 1
    }})
    
    var sample_test = context("lifecycle", function() { with(this) {
      before(function() { with(this) {
        this.inherited_before_each_var = inherited_before_each_var || 0
        this.inherited_before_each_var  += 4
      }})
      
      after(function() { with(this) {
        this.after_each_var   = this.after_each_var || 0
        this.after_each_var  += 1
      }})
      
      before("all", function() { with(this) {
        this.before_all_var   = this.before_all_var || 0
        this.before_all_var  += 1
      }})
      
      after("all", function() { with(this) {
        this.after_all_var   = this.after_all_var || 0
        this.after_all_var  += 1
      }})
      
      after("a_method")
      
      test("foo", function() {})
    }})
    
    before(function() { with(this) {
      this.superclass_before_each_var   = this.superclass_before_each_var || 0
      this.superclass_before_each_var  += 1
    }})
    
    after(function() { with(this) {
      this.superclass_after_each_var   = this.superclass_after_each_var || 0
      this.superclass_after_each_var  += 1
    }})
    
    before("all", function() { with(this) {
      this.superclass_before_all_var   = this.superclass_before_all_var || 0
      this.superclass_before_all_var  += 1
    }})
    
    after("all", function() { with(this) {
      this.superclass_after_all_var   = this.superclass_after_all_var || 0
      this.superclass_after_all_var  += 1
    }})
    
    context("With before/after :each blocks", function() { with(this) {
      before(function() { with(this) {
        this.result = new JS.Test.Unit.TestResult()
        this.test = new sample_test("test: Test.Context lifecycle hooks lifecycle foo")
        this.test.run(this.result, function() {  })
      }})

      it("it runs superclass before callbacks in ofrder", function() { with(this) {
        assertEqual( 1, test.superclass_before_each_var )
      }})
      
      it("it runs inherited before callbacks in order", function() { with(this) {
        assertEqual( 7, test.inherited_before_each_var )
      }})
      
      it("it runs before callbacks in order", function() { with(this) {
        assertEqual( 1, test.inherited_before_each_var_2 )
      }})
      
      it("it runs superclass after callbacks", function() { with(this) {
        assertEqual( 1, test.superclass_after_each_var )
      }})
      
      it("it runs inherited after callbacks", function() { with(this) {
        assertEqual( 1, test.inherited_after_each_var )
      }})
      
      it("it runs after callbacks", function() { with(this) {
        assertEqual( 1, test.after_each_var )
      }})
      
      it("it runs after callbacks specified with method names, instead of blocks", function() { with(this) {
        assertEqual( "a method ran", test.ivar )
      }})
    }})
    
    context("With the before option", function() { with(this) {
      setup(function() { with(this) {
        this.jvar = "override success!"
      }})
      
      var l = function() { this.ivar = "awesome" }
      should("run the lambda", {before: l}, function() { with(this) {
        assertEqual( "awesome", ivar )
      }})

      var l = function() { this.jvar = "should be overridden" }
      should("run the lambda before the setup", {before: l}, function() { with(this) {
        assertEqual( "override success!", jvar )
      }})
    }})
    
    def("a_method", function() {
      this.ivar = "a method ran"
    })
  }})
  
  describe("nested lifecycle hooks", function() { with(this) {
    before("all", function() {
      this.ivar = 0
    })
    
    before(function() {
      this.ivar += 1
    })
    context("A new context", function() { with(this) {
      before(function() {
        this.ivar += 1
      })
      
      before("all", function() {
        this.ivar = 0
      })
      
      context("A nested context", function() { with(this) {
        before(function() {
          this.ivar += 1
        })
        
        before("all", function() {
          this.ivar += 1
        })
        
        context("A second, nested context", function() { with(this) {
          before(function() {
            this.ivar += 1
          })
          
          before("all", function() {
            this.ivar += 1
          })
          
          it("should set var", function() {
            this.assertEqual( 6, this.ivar )
          })
        }})
      }})
    }})
  }})
  
  describe("shared groups", function() { with(this) {
    def("test_shared_aliases", function() { with(this) {
      forEach($w("sharedBehavior shareAs shareBehaviorAs sharedExamplesFor"),
      function(methodAlias) {
        assertRespondTo( this.klass, methodAlias )
      }, this)
    }})
    
    def("test_use_aliases", function() { with(this) {
      forEach($w("uses itShouldBehaveLike behavesLike usesExamplesFrom"),
      function(methodAlias) {
        assertRespondTo( this.klass, methodAlias )
      }, this)
    }})
    
    context("A shared group", function() { with(this) {
      context("creates a module", function() { with(this) {
        test("based on a string name", function() { with(this) {
          this.klass.shared("things and fun", function() {
          })
          
          assert( ThingsAndFun )
          assertEqual( JS.Test.Context.SharedBehavior, ThingsAndFun.klass )
        }})
      }})
      
      context("should be locatable", function() { with(this) {
        shared("hello madam", function() { with(this) {
          def("fantastic!", function() {
            print( "you know me!" )
          })
        }})
        
        it("by a string", function() { with(this) {
          var self = this
          assertNothingThrown(function() {
            self.klass.use("hello madam")
          })
        }})
      
        shared("hi dog", function() { with(this) {
          def("stupendous!", function() {
            print( "hoo hah!" )
          })
        }})
      
        it("by direct reference", function() { with(this) {
          var self = this
          assertNothingThrown(function() {
            self.klass.use(HiDog)
          })
        }})
      }})
      
      context("should include its shared behavior", function() { with(this) {
        shared("Porthos", function() { with(this) {
          def("parry", function() {
            return true
          })
        }})
        
        it("by a string", function() { with(this) {
          this.klass.use("Porthos")
          assert( parry() )
        }})
        
        shared("Aramis", function() { with(this) {
          def("lunge", function() {
            return true
          })
        }})
        
        it("by direct reference", function() { with(this) {
          this.klass.use(Aramis)
          assert( lunge() )
        }})
      }})
    }})
  }})
}})

