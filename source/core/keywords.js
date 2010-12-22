JS.Method.keyword('callSuper', function(receiver, args) {
  var methods    = receiver.__eigen__().lookup(this.name),
      stackIndex = methods.length - 1,
      params     = JS.array(args);
  
  receiver.callSuper = function() {
    var i = arguments.length;
    while (i--) params[i] = arguments[i];
    
    stackIndex -= 1;
    var returnValue = methods[stackIndex].callable.apply(receiver, params);
    stackIndex += 1;
    
    return returnValue;
  };
});

