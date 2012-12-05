JS.Test.Reporters.extend({
  Console: new JS.Class({
    _log: function(eventName, data) {
      if (!window.console || !window.console.log || !window.JSON) return;
      console.log(JSON.stringify({jstest: [eventName, data]}));
    }
  })
});


(function() {
  var methods = JS.Test.Reporters.METHODS,
      n       = methods.length;
  
  while (n--)
    (function(i) {
      var method = methods[i];
      JS.Test.Reporters.Console.define(method, function(event) {
        this._log(method, event);
      });
    })(n);
})();

