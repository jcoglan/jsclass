JS.require('JS.Enumerable', function(Enumerable) {

JS.ENV.Test = JS.ENV.Test || {}

Test.ContextSpec = JS.Test.describe(JS.Test.Context, function() { with(this) {
  include(JS.Test.Helpers)

  define("test_can_write_tests_without_context", function() {
    this.assert( true )
  })

  context("A new context", function() { with(this) {
    context("when not nested", function() { with(this) {
      before("each", function() { with(this) {
        var klass = new JS.Class(JS.Test.Unit.TestCase)
        klass.include(JS.Test.Context)
        this.context = klass.context("When testing", function() {
                         define("test_this_thing", function() {
                           return true
                         })
                       })
      }})

      it("should be a Test.Unit.TestCase", function() { with(this) {
        assert( JS.indexOf(context.ancestors(), JS.Test.Unit.TestCase) !== -1 )
      }})
    }})

    context("when nested", function() { with(this) {
      before("each", function() { with(this) {
        this.context = this.klass.context("and we're testing", function() { with(this) {
          __eigen__().define("nested", function() {
            return this.context("should be nested", function() {
              define("test_this_thing", function() {
                return true
              })
            })
          })
        }})
      }})

      it("should also be a Test.Unit.TestCase", function() { with(this) {
        assert( JS.indexOf(context.nested().ancestors(), JS.Test.Unit.TestCase) !== -1 )
      }})
    }})
  }})

  describe("lifecycle hooks", function() { with(this) {
    extend({ hook_register: new Enumerable.Collection() })

    before(function() { with(this) {
      klass.hook_register.push("inherited_before_each")
      this.inherited_before_each_var = true
    }})

    after(function() { with(this) {
      klass.hook_register.push("inherited_after_each")
    }})

    before("all", function() { with(this) {
      klass.hook_register.clear()
      klass.hook_register.push("inherited_before_all")
      this.inherited_before_all_var = true
    }})

    after("all", function() { with(this) {
      klass.hook_register.push("inherited_after_all")
    }})

    define("sample_test", context("lifecycle", function() { with(this) {
      before(function() { with(this) {
        klass.hook_register.push("before_each")
        this.before_each_var = true
      }})

      after(function() { with(this) {
        klass.hook_register.push("after_each")
      }})

      before("all", function() { with(this) {
        klass.hook_register.push("before_all")
        this.before_all_var = true
      }})

      after("all", function() { with(this) {
        klass.hook_register.push("after_all")
      }})

      after("a_method")

      test("foo", function() {})

      test("bar", function() {})
    }}))

    before(function() { with(this) {
      klass.hook_register.push("superclass_before_each")
    }})

    after(function() { with(this) {
      klass.hook_register.push("superclass_after_each")
    }})

    before("all", function() { with(this) {
      klass.hook_register.push("superclass_before_all")
    }})

    after("all", function() { with(this) {
      klass.hook_register.push("superclass_after_all")
    }})

    context("With before/after :each blocks", function() { with(this) {
      before(function(resume) { with(this) {
        this.result = new JS.Test.Unit.TestResult()
        this.suite  = sample_test.suite()
        var self = this // TODO remove
        suite.run(this.result, function() {
          self.hooks = klass.hook_register
          resume()
        }, function() {}, this)
      }})

      it("applies state from before :all blocks to each test", function() { with(this) {
        suite.forEach(function(test, resume) {
          assert( test.inherited_before_all_var )
          assert( test.before_all_var )
          resume()
        })
      }})

      it("applies state from before :each blocks to each test", function() { with(this) {
        suite.forEach(function(test, resume) {
          assert( test.inherited_before_each_var )
          assert( test.before_each_var )
          resume()
        })
      }})

      it("runs :all blocks once per suite", function() { with(this) {
        assertEqual( 1, hooks.count("inherited_before_all") )
        assertEqual( 1, hooks.count("inherited_after_all") )
        assertEqual( 1, hooks.count("superclass_before_all") )
        assertEqual( 1, hooks.count("superclass_after_all") )
        assertEqual( 1, hooks.count("before_all") )
        assertEqual( 1, hooks.count("after_all") )
      }})

      it("runs :each blocks once per test", function() { with(this) {
        assertEqual( 2, hooks.count("inherited_before_each") )
        assertEqual( 2, hooks.count("inherited_after_each") )
        assertEqual( 2, hooks.count("superclass_before_each") )
        assertEqual( 2, hooks.count("superclass_after_each") )
        assertEqual( 2, hooks.count("before_each") )
        assertEqual( 2, hooks.count("after_each") )
      }})

      it("runs after callbacks specified with method names, instead of blocks", function() { with(this) {
        assertEqual( 2, hooks.count("a method ran") )
      }})

      it("runs before_all, then before_each, then after_each, then after_all", function() { with(this) {
        assertEqual( ["inherited_before_all",       "superclass_before_all",  "before_all",
                      "inherited_before_each",      "superclass_before_each", "before_each",
                      "after_each", "a method ran", "inherited_after_each",   "superclass_after_each",
                      "inherited_before_each",      "superclass_before_each", "before_each",
                      "after_each", "a method ran", "inherited_after_each",   "superclass_after_each",
                      "after_all",                  "inherited_after_all",    "superclass_after_all"],
                     klass.hook_register.entries() )
      }})
    }})

    define("a_method", function() { with(this) {
      klass.hook_register.push("a method ran")
    }})

    context("With the before option", function() { with(this) {
      setup(function() {
        this.jvar = "override success!"
      })

      var l = function() { this.ivar = "awesome" }
      should("run the lambda", {before: l}, function() { with(this) {
        assertEqual( "awesome", ivar )
      }})

      var l = function() { this.jvar = "should be overridden" }
      should("run the lambda before the setup", {before: l}, function() { with(this) {
        assertEqual( "override success!", jvar )
      }})
    }})
  }})

  describe("nested lifecycle hooks", function() { with(this) {
    before("all", function() {
      this.ivar = [0]
    })

    before(function() {
      this.ivar.push(1)
    })
    context("A new context", function() { with(this) {
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
    }})
  }})

  describe("shared groups", function() { with(this) {
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
          define("fantastic!", function() { print( "you know me!" ) })
        }})

        it("by a string", function() { with(this) {
          assertNothingThrown(function() { this.klass.use("hello madam") }, this)
        }})

        shared("hi dog", function() { with(this) {
          define("stupendous!", function() { print( "hoo hah!" ) })
        }})

        it("by direct reference", function() { with(this) {
          assertNothingThrown(function() { this.klass.use(HiDog) }, this)
        }})

        context("across nesting hierarchies", function() { with(this) {
          before(function() { with(this) {
            this.klass.context("hidden", function() {
              shared("useful bits", function() {
                define("helper", function() {})
              })
            })
          }})

          it("by a string", function() { with(this) {
            assertNothingThrown(function() { this.klass.use("useful bits") }, this)
          }})
        }})
      }})

      context("should include its shared behavior", function() { with(this) {
        shared("Porthos", function() { with(this) {
          define("parry", function() { return true })
        }})

        it("by a string", function() { with(this) {
          this.klass.use("Porthos")
          assert( parry() )
        }})

        shared("Aramis", function() { with(this) {
          define("lunge", function() { return true })
        }})

        it("by direct reference", function() { with(this) {
          this.klass.use(Aramis)
          assert( lunge() )
        }})

        context("across nesting hierarchies", function() { with(this) {
          before(function() { with(this) {
            this.klass.context("hidden", function() {
              shared("useful stuff", function() {
                define("helper", function() { return true })
              })
              shared("other things", function() {
                define("handy", function() { return true })
              })
            })
          }})

          it("by a string", function() { with(this) {
            this.klass.use("useful stuff")
            assert( helper() )
          }})

          it("only for the using context", function() { with(this) {
            this.klass.context("inner", function() {
              this.use("other things")
            })
            // assertEqual( "undefined", typeof handy ) // TODO fix
          }})
        }})
      }})
    }})
  }})
}})

})

