(function() {
  this.JS = this.JS || {};
})();

JS.extend = function(destination, source, overwrite) {
  if (!destination || !source) return destination;
  for (var field in source) {
    if (destination[field] === source[field]) continue;
    if (overwrite === false && destination.hasOwnProperty(field)) continue;
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
  
  constructor.prototype.constructor =
  constructor.prototype.klass = constructor;
  
  return constructor;
};

