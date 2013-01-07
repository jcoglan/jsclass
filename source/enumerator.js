(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {

var Enumerator = new JS.Class('Enumerator', {
  include: Enumerable,

  extend: {
    DEFAULT_METHOD: 'forEach'
  },

  initialize: function(object, method, args) {
    this._object = object;
    this._method = method || this.klass.DEFAULT_METHOD;
    this._args   = (args || []).slice();
  },

  // this is largely here to support testing since I don't want to make the
  // ivars public
  equals: function(enumerator) {
    return JS.isType(enumerator, this.klass) &&
           this._object === enumerator._object &&
           this._method === enumerator._method &&
           Enumerable.areEqual(this._args, enumerator._args);
  },

  forEach: function(block, context) {
    if (!block) return this;
    var args = this._args.slice();
    args.push(block);
    if (context) args.push(context);
    return this._object[this._method].apply(this._object, args);
  }
});

Enumerator.alias({
  cons:       'forEachCons',
  reverse:    'reverseForEach',
  slice:      'forEachSlice',
  withIndex:  'forEachWithIndex',
  withObject: 'forEachWithObject'
});

JS.Kernel.include({
  enumFor: function(method) {
    var args   = JS.array(arguments),
        method = args.shift();
    return new Enumerator(this, method, args);
  }
}, {_resolve: false});

JS.Kernel.alias({toEnum: 'enumFor'});

exports.Enumerator = Enumerable.Enumerator = Enumerator;
});

