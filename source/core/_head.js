<%= license %>

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');
  
  if (E)
    exports.JS = exports;
  else
    $.JS = $.JS || {};

  factory($, E ? exports : $.JS);

})(function(global, exports) {

