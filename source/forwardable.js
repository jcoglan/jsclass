(function(factory) {
  var E  = (typeof exports === 'object'),
      js = E ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {

var Forwardable = new JS.Module('Forwardable', {
  defineDelegator: function(subject, method, alias, resolve) {
    alias = alias || method;
    this.define(alias, function() {
      var object   = this[subject],
          property = object[method];

      return (typeof property === 'function')
          ? property.apply(object, arguments)
          : property;
    }, {_resolve: resolve !== false});
  },

  defineDelegators: function() {
    var methods = JS.array(arguments),
        subject = methods.shift(),
        i       = methods.length;

    while (i--) this.defineDelegator(subject, methods[i], methods[i], false);
    this.resolve();
  }
});

exports.Forwardable = Forwardable;
});

