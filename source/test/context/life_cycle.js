Test.Context.LifeCycle = new JS.Module({
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
        if ((typeof period === 'function') || !block) {
          block  = period;
          period = 'each';
        }

        this['before_' + (period + '_') + 'callbacks'].push(block);
      },

      after: function(period, block) {
        if ((typeof period === 'function') || !block) {
          block  = period;
          period = 'each';
        }

        this['after_' + (period + '_') + 'callbacks'].push(block);
      },

      gatherCallbacks: function(callbackType, period) {
        var outerCallbacks = (typeof this.superclass.gatherCallbacks === 'function')
          ? this.superclass.gatherCallbacks(callbackType, period)
          : [];

        var mine = this[callbackType + '_' + (period + '_') + 'callbacks'];

        return (callbackType === 'before')
                ? outerCallbacks.concat(mine)
                : mine.concat(outerCallbacks);
      }
    })
  },

  setup: function(resume) {
    if (this.klass.before_should_callbacks[this._methodName])
      this.klass.before_should_callbacks[this._methodName].call(this);

    this.runCallbacks('before', 'each', resume);
  },

  teardown: function(resume) {
    this.runCallbacks('after', 'each', resume);
  },

  runCallbacks: function(callbackType, period, continuation) {
    var callbacks = this.klass.gatherCallbacks(callbackType, period);

    Test.Unit.TestSuite.forEach(callbacks, function(callback, resume) {
      this.exec(callback, resume, continuation);
    }, continuation, this);
  },

  runAllCallbacks: function(callbackType, continuation, context) {
    var previousIvars = this.instanceVariables();
    this.runCallbacks(callbackType, 'all', function() {

      var ivars = this.instanceVariables().inject({}, function(hash, ivar) {
        if (previousIvars.member(ivar)) return hash;
        hash[ivar] = this[ivar];
        return hash;
      }, this);

      if (continuation) continuation.call(context, ivars);
    });
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
    return new Enumerable.Collection(ivars);
  }
});

(function() {
  var m = Test.Context.LifeCycle.ClassMethods.method('instanceMethod');

  Test.Context.LifeCycle.ClassMethods.include({
    setup:    m('before'),
    teardown: m('after')
  });
})();

