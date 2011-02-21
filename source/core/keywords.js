JS.Method.keyword('callSuper', function(method, env, receiver, args) {
  var methods    = env.lookup(method.name),
      stackIndex = methods.length - 1,
      params     = JS.array(args);
  
  return function() {
    var i = arguments.length;
    while (i--) params[i] = arguments[i];
    
    stackIndex -= 1;
    var returnValue = methods[stackIndex].apply(receiver, params);
    stackIndex += 1;
    
    return returnValue;
  };
});

JS.Method.keyword('blockGiven', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity),
      hasBlock = (typeof block[0] === 'function');
  
  return function() { return hasBlock };
});

JS.Method.keyword('yieldWith', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity);
  
  return function() {
    if (typeof block[0] !== 'function') return;
    return block[0].apply(block[1] || null, arguments);
  };
});

