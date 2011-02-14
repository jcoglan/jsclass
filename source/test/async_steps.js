JS.Test.extend({
  AsyncSteps: new JS.Class(JS.Module, {
    define: function(name, method) {
      this.callSuper(name, function() {
        var args = [name, JS.Test.selfless(method)].concat(JS.array(arguments));
        this.__enqueue__(args);
      });
    },
    
    included: function(klass) {
      klass.include(JS.Test.AsyncSteps.Sync);
      if (klass.includes(JS.Test.Context))
        klass.after(function(resume) { sync(resume) });
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
            while (callback = this.__stepCallbacks__.shift()) callback();
            return;
          }
          
          var methodName = step.shift(),
              method     = step.shift(),
              parameters = step.slice(),
              block      = function() { method.apply(this, parameters) };
          
          parameters[method.length - 1] = this.method('__runNextStep__');
          if (!this.exec) return block.call(this);
          this.exec(block, function() {}, this.method('__endSteps__'));
        },

        __endSteps__: function() {
          this.__stepQueue__ = [];
          this.__runNextStep__();
        },
        
        sync: function(callback) {
          if (!this.__runningSteps__) return callback();
          this.__stepCallbacks__ = this.__stepCallbacks__ || [];
          this.__stepCallbacks__.push(callback);
        }
      })
    }
  }),
  
  asyncSteps: function(methods) {
    return new this.AsyncSteps(methods);
  }
});
