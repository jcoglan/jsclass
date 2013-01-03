(function(factory) {
  var E  = (typeof exports === 'object'),
      js = E ? require('./core') : JS,

      Enumerable = (E ? require('./enumerable') : js).Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {

