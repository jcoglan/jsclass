JS.Test.extend({
  AsyncSteps: new JS.Class(JS.Module, {
    define: function(name, method) {
      this.callSuper(name, function() {
        var args = [name, method].concat(JS.array(arguments));
        this.__enqueue__(args);
      });
    },
    
    included: function(klass) {
      klass.include(JS.Test.AsyncSteps.Sync);
      if (klass.includes(JS.Test.Context))
        klass.include(JS.Test.AsyncSteps.Hooks);
    },
    
    extend: {
      Sync: new JS.Module({
        __enqueue__: function(args) {
          this.__stepQueue__ = this.__stepQueue__ || [];
          this.__stepQueue__.push(args);
          if (this.__runningSteps__) return;
          this.__runningSteps__ = true;
          JS.ENV.setTimeout(this.method('__runNextStep__'), 1);
        },
        
        __runNextStep__: function() {
          var step = this.__stepQueue__.shift(), callback;
          
          if (!step) {
            this.__runningSteps__ = false;
            if (!this.__stepCallbacks__) return;
            while (callback = this.__stepCallbacks__.shift())callback();
            return;
          }
          
          var methodName = step.shift(),
              method     = step.shift(),
              parameters = step.slice();
          
          parameters[method.length - 1] = this.method('__runNextStep__');
          this.__executeStep__(function() { method.apply(this, parameters) },
                               this.method('__runNextStep__'));
        },
        
        __executeStep__: function(block) {
          block.call(this);
        },
        
        sync: function(callback) {
          if (!this.__runningSteps__) return callback();
          this.__stepCallbacks__ = this.__stepCallbacks__ || [];
          this.__stepCallbacks__.push(callback);
        }
      }),
      
      Hooks: new JS.Module({
        __executeStep__: function(block, onError) {
          this.exec(block, function() {}, onError);
        },
        
        extend: {
          included: function(testCase) {
            testCase.after(function(resume) { sync(resume) });
          }
        }
      })
    }
  }),
  
  asyncSteps: function(methods) {
    return new this.AsyncSteps(methods);
  },
  
  puts: function(string) {
    require('sys').puts(string);
  }
});
