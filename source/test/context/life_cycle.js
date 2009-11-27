/** section: test
 * mixin JS.Test.Context.LifeCycle
 **/
JS.Test.Context.LifeCycle = new JS.Module({
  extend: {
    included: function(base) {
      base.extend(this.ClassMethods);
      
      base.before_all_callbacks     = [];
      base.before_each_callbacks    = [];
      base.after_all_callbacks      = [];
      base.after_each_callbacks     = [];
      base.before_should_callbacks  = {};
      
      base.extend({
        inherited: function(child) {
          this.callSuper();
          child.before_all_callbacks    = [];
          child.before_each_callbacks   = [];
          child.after_all_callbacks     = [];
          child.after_each_callbacks    = [];
          child.before_should_callbacks = {};
        }
      });
    },
    
    ClassMethods: new JS.Module({
      before: function(period, block) {
        if (JS.isFn(period)) {
          block  = period;
          period = 'each';
        }
        
        this['before_' + (period + '_') + 'callbacks'].push(block);
      },
      
      after: function(period, block) {
        if (JS.isFn(period)) {
          block  = period;
          period = 'each';
        }
        
        this['after_' + (period + '_') + 'callbacks'].push(block);
      },
      
      gatherCallbacks: function(callbackType, period) {
        var callbacks = JS.isFn(this.superclass.gatherCallbacks)
          ? this.superclass.gatherCallbacks(callbackType, period)
          : [];
        
        var mine = this[callbackType + '_' + (period + '_') + 'callbacks'];
        for (var i = 0, n = mine.length; i < n; i++)
          callbacks.push(mine[i]);
        
        return callbacks;
      }
    })
  },
  
  setup: function(block) {
    this.callSuper();
    
    if (this.klass.before_should_callbacks[this._methodName])
      this.klass.before_should_callbacks[this._methodName].call(this);
    
    this.runCallbacks('before', 'each');
  },
  
  teardown: function() {
    this.callSuper();
    this.runCallbacks('after', 'each');
  },
  
  runCallbacks: function(callbackType, period) {
    var callbacks = this.klass.gatherCallbacks(callbackType, period);
    for (var i = 0, n = callbacks.length; i < n; i++)
      callbacks[i].call(this);
  },
  
  runAllCallbacks: function(callbackType) {
    var previousIvars = this.instanceVariables();
    this.runCallbacks(callbackType, 'all');
    return this.instanceVariables().inject({}, function(hash, ivar) {
      if (previousIvars.member(ivar)) return hash;
      hash[ivar] = this[ivar];
      return hash;
    }, this);
  },
  
  setValuesFromCallbacks: function(values) {
    for (var key in values)
      this[key] = values[key];
  },
  
  instanceVariables: function() {
    var ivars = [];
    for (var key in this) {
      if (this.hasOwnProperty(key)) ivars.push(key);
    }
    return new JS.Enumerable.Collection(ivars);
  }
});

(function() {
  var m = JS.Test.Context.LifeCycle.ClassMethods.method('instanceMethod');
  
  JS.Test.Context.LifeCycle.ClassMethods.include({
    setup:    m('before'),
    teardown: m('after')
  });
})();

