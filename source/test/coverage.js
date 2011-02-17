JS.Test.extend({
  Coverage: new JS.Class({
    initialize: function(module) {
      this._methods = new JS.Hash([]);
      var methods = module.instanceMethods(false), i = methods.length;
      while (i--)
        this._methods.store(module.instanceMethod(methods[i]), 0);
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
      JS.Console.printTable(methods, function(row, i) {
        if (row[1] === 0) return ['bgred', 'white'];
        return (i % 2 === 0) ? ['bold'] : [];
      });
    }
  })
});
