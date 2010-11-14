JS.Inclusion = JS.makeClass();

JS.extend(JS.Inclusion.prototype, {
  initialize: function(host, mixin) {
    this._methods = {};
    this.host     = host;
    this.mixin    = mixin;
  },
  
  acceptMethod: function(name, method) {
    if (this._methods.hasOwnProperty(name)) return;
    
    var node = this;
    while (node = node.prev) node._methods[name] = method;
    this.host.acceptMethod(name, method);
  }
});

