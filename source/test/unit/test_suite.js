JS.Test.Unit.extend({
  TestSuite: new JS.Class({
    include: JS.Enumerable,
    
    extend: {
      STARTED:  'Test.Unit.TestSuite.STARTED',
      FINISHED: 'Test.Unit.TestSuite.FINISHED',
      
      forEach: function(tests, block, continuation, context) {
        var looping    = false,
            n          = tests.length,
            i          = -1,
            calls      = 0,
            setTimeout = this.setTimeout;
        
        var ping = function() {
          calls += 1;
          if (JS.Console.BROWSER) setTimeout(iterate, 1);
          else loop();
        };
        
        var loop = function() {
          if (looping) return;
          looping = true;
          while (calls > 0) iterate();
          looping = false;
        };
        
        var iterate = function() {
          i += 1; calls -= 1;
          if (i === n) return continuation && continuation.call(context || null);
          block.call(context || null, tests[i], ping);
        };
        
        ping();
      },
      
      // Fun fact: in IE, typeof setTimeout === 'object'
      setTimeout: (function() {
        return (typeof setTimeout === 'undefined')
               ? undefined
               : setTimeout;
      })()
    },
    
    initialize: function(name) {
      this._name = name || 'Unnamed TestSuite';
      this._tests = [];
    },
    
    forEach: function(block, continuation, context) {
      this.klass.forEach(this._tests, block, continuation, context);
    },
    
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this._name);
      
      this.forEach(function(test, resume) {
        test.run(result, resume, callback, context)
        
      }, function() {
        callback.call(context || null, this.klass.FINISHED, this._name);
        continuation.call(context || null);
        
      }, this);
    },
    
    push: function(test) {
      this._tests.push(test);
      return this;
    },
    
    remove: function(test) {
      var i = this._tests.length;
      while (i--) {
        if (this._tests[i] === test) this._tests.splice(i,1);
      }
    },
    
    size: function() {
      var totalSize = 0, i = this._tests.length;
      while (i--) {
        totalSize += this._tests[i].size();
      }
      return totalSize;
    },
    
    empty: function() {
      return this._tests.length === 0;
    },
    
    toString: function() {
      return this._name;
    }
  })
});

