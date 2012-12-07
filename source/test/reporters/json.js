JS.Test.Reporters.extend({
  JSON: new JS.Class({
    include: JS.Console,
    
    _log: function(eventName, data) {
      if (!JS.ENV.JSON) return;
      this.puts(JSON.stringify({jstest: [eventName, data]}));
    },
    
    extend: {
      Reader: new JS.Class({
        initialize: function(reporter) {
          this._reporter = reporter;
        },
        
        read: function(message) {
          if (!JS.ENV.JSON) return false;
          try {
            var data    = JSON.parse(message),
                payload = data.jstest,
                method  = payload[0],
                event   = payload[1];
            
            this._reporter[method](event);
            return true;
          }
          catch (e) {
            return false;
          }
        }
      })
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

