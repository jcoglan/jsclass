var JS = (typeof this.JS === 'undefined') ? {} : this.JS;
JS.Date = Date;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  } else {
    $.JS = JS;
  }
  factory($, JS);

})(function(global, exports) {
'use strict';

