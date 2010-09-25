var puts = require('sys').puts;

(function() {
  this.JS = this.JS || {};
})();

JS.extend = function(destination, source) {
  if (!destination || !source) return destination;
  for (var field in source) {
    if (destination[field] !== source[field])
      destination[field] = source[field];
  }
  return destination;
};

JS.makeBridge = function(parent) {
  var bridge = function() {};
  bridge.prototype = parent.prototype;
  return new bridge();
};

JS.makeClass = function(parent) {
  var constructor = function() {
    return this.initialize
         ? this.initialize.apply(this, arguments) || this
         : this;
  };
  constructor.prototype = JS.makeBridge(parent || Object);
  return constructor;
};

