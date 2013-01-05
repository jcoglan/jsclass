<%= license %>

var JS = (typeof JS === 'undefined') ? {} : JS;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  }
  factory($, JS);

})(function(global, exports) {

