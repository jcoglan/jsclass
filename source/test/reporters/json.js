JS.Test.Reporters.extend({
  JSON: new JS.Class({
    include: JS.Console,
    
    _log: function(eventName, data) {
      if (!JS.ENV.JSON) return;
      this.puts(JSON.stringify({jstest: [eventName, data]}));
    }
  })
});

(function() {
  var methods = JS.Test.Reporters.METHODS,
      n       = methods.length;
  
  while (n--)
    (function(i) {
      var method = methods[i];
      JS.Test.Reporters.JSON.define(method, function(event) {
        this._log(method, event);
      });
    })(n);
})();

JS.Test.Reporters.register('json', JS.Test.Reporters.JSON);

