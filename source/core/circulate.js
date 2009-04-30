JS.Module = JS.extend(new JS.Class('Module', JS.Module.prototype), JS.Kernel.__fns__);
JS.Module.include(JS.Kernel);
JS.Class = JS.extend(new JS.Class('Class', JS.Module, JS.Class.prototype), JS.Kernel.__fns__);
JS.Module.klass = JS.Module.constructor =
JS.Class.klass = JS.Class.constructor = JS.Class;

JS.Module.extend({
  _observers: [],
  methodAdded: function(block, context) {
    this._observers.push([block, context]);
  },
  _notify: function(name, object) {
    var obs = this._observers, i = obs.length;
    while (i--) obs[i][0].call(obs[i][1] || null, name, object);
  }
});

