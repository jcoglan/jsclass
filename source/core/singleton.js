JS.Singleton = new JS.Class({
  initialize: function(parent, methods) {
    return new (new JS.Class(parent, methods));
  }
});

