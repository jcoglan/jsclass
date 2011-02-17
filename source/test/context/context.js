JS.Test.extend({
  /** section: test
   * mixin JS.Test.Context
   * 
   * `JS.Test.Context` is a JavaScript version of Context, an extension for
   * `Test::Unit` written by Jeremy McAnally. It provides a DSL for more
   * readable test suites using nestable context blocks with before/after
   * hooks and natural-language test names.
   * 
   * Copyright (c) 2008 Jeremy McAnally
   * 
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   * 
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   **/
  Context: new JS.Module({
    extend: {
      included: function(base) {
        base.extend(JS.Test.Context.Context, false);
        base.include(JS.Test.Context.LifeCycle, {_resolve: false});
        base.extend(JS.Test.Context.Test, false);
        base.include(JS.Console);
      },
      
      /** section: test
       * mixin JS.Text.Context.Context
       **/
      Context: new JS.Module({
        getContextName: function() {
          this._contextName = this._contextName || '';
          return (typeof this.superclass.getContextName === 'function')
            ? (this.superclass.getContextName() + ' ' + this._contextName).replace(/^\s+/, '')
            : this.displayName;
        },
        
        setContextName: function(name) {
          this._contextName = name;
        },
        
        /**
         * JS.Text.Context.Context#context(name, block) -> JS.Class
         * 
         * Add a context to a set of tests.
         * 
         *   context("a new account", function() { with(this) {
         *     it("should not have users", function() {
         *       this.assert( new Account().users.empty() );
         *     })
         *   }})
         * 
         * The context name is prepended to the test name, so failures look like this:
         * 
         *   1) Failure:
         *   test a new account should not have users():
         *   <false> is not true.
         * 
         * Contexts can also be nested like so:
         * 
         *   context("a new account", function() { with(this) {
         *     context("created by the web application", function() { with(this) {
         *       it("should have web as its vendor", function() {
         *         this.assertEqual( "web", users('web_user').vendor );
         *       })
         *     }})
         *   }})
         **/
        context: function(name, block) {
          var klass = new JS.Class(this, {}, {_resolve: false});
          klass.__eigen__().resolve();
          
          klass.setContextName(name.toString());
          klass.setName(klass.getContextName());
          
          JS.Test.selfless(block).call(klass);
          
          return klass;
        },
        
        cover: function(module) {
          var logger = new JS.Test.Coverage(module);
          
          this.before_all_callbacks.push(function() {
            JS.StackTrace.addObserver(logger);
            JS.Method.trace([module]);
          });
          
          this.after_all_callbacks.push(function() {
            JS.Method.untrace([module]);
            JS.StackTrace.removeObserver(logger);
          });
          JS.Test.Unit.TestCase.reports.push(logger);
        }
      })
    }
  }),
  
  describe: function(name, block) {
    var klass = new JS.Class(name.toString(), JS.Test.Unit.TestCase, {}, {_resolve: false});
    klass.include(JS.Test.Context, {_resolve: false});
    klass.__eigen__().resolve();
    
    JS.Test.selfless(block).call(klass);
    
    return klass;
  },
  
  selfless: function(block) {
    if (typeof block !== 'function') return block;
    
    var source = block.toString(),
        args   = source.match(/^[^\(]*\(([^\(]*)\)/)[1].split(/\s*,\s*/),
        body   = source.match(/^[^\{]*{((.*\n*)*)}/m)[1];
    
    body = 'with(this) { ' + body + ' }';
    
    if (args.length === 3)
      return new Function(args[0], args[1], args[2], body);
    else if (args.length === 2)
      return new Function(args[0], args[1], body);
    else if (args.length === 1)
      return new Function(args[0], body);
    else if (args.length === 0)
      return new Function(body);
   }
});

JS.Test.Context.Context.alias({describe: 'context'});

JS.Test.extend({
  context:  JS.Test.describe
});

