(function(factory) {
  var E  = (typeof exports === 'object'),
      js = E ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {

