JS.Test.extend({
  Coverage: new JS.Class({
    initialize: function(module) {
      this._module = module;
      this._methods = new JS.Hash([]);
      
      var storeMethods = function(module) {
        var methods = module.instanceMethods(false),
            i = methods.length;
        while (i--) this._methods.store(module.instanceMethod(methods[i]), 0);
      };
      storeMethods.call(this, module);
      storeMethods.call(this, module.__eigen__());
    },
    
    attach: function() {
      var module = this._module;
      JS.StackTrace.addObserver(this);
      JS.Method.trace([module, module.__eigen__()]);
    },
    
    detach: function() {
      var module = this._module;
      JS.Method.untrace([module, module.__eigen__()]);
      JS.StackTrace.removeObserver(this);
    },
    
    update: function(event, frame) {
      if (event !== 'call') return;
      var pair = this._methods.assoc(frame.method);
      if (pair) pair.setValue(pair.value + 1);
    },
    
    report: function() {
      var methods = this._methods.entries().sort(function(a,b) {
        return b.value - a.value;
      });
      var covered = this._methods.all(function(pair) { return pair.value > 0 });
      
      JS.Console.printTable(methods, function(row, i) {
        if (row[1] === 0) return ['bgred', 'white'];
        return (i % 2 === 0) ? ['bold'] : [];
      });
      return covered;
    }
  })
});
