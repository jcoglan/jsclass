JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
    this.callable = callable;
    
    this._words = {};
    if (typeof callable !== 'function') return;
    
    var matches = callable.toString().match(/\b[a-z\_\$][a-z0-9\_\$]*\b/ig),
        i       = matches.length;
    
    while (i--) this._words[matches[i]] = true;
  },
  
  setName: function(name) {
    this.callable.displayName = name;
  },
  
  call: function() {
    return this.callable.call.apply(this.callable, arguments);
  },
  
  compile: function(host) {
    var callable = this.callable,
        words    = this._words,
        keywords = JS.Method._keywords,
        i        = keywords.length,
        keyword;
    
    while (i--) {
      keyword = keywords[i];
      if (words[keyword.name])
        callable = keyword.transform(callable, this, host);
    }
    return callable;
  }
});

JS.Method.create = function(module, name, callable) {
  if (callable && callable.__inc__ && callable.__fns__)
    return callable;
  
  return (callable instanceof this)
       ? callable
       : new this(module, name, callable);
};

JS.Method.compile = function(method, host) {
  if (method instanceof this) return method.compile(host);
  else return method;
};

JS.Method._keywords = [
  { name: 'callSuper',
    transform: function(callable, method, host) {
      return function() {
        var currentSuper = this.callSuper,
            parameters   = [].slice.apply(arguments),
            functions    = host.lookup(method.name),
            stackIndex   = functions.length;
        
        this.callSuper = function() {
          var i = arguments.length;
          while (i--) parameters[i] = arguments[i];
          stackIndex -= 1;
          var value = functions[stackIndex].callable.apply(this, parameters);
          stackIndex += 1;
          return value;
        };
        
        var returnValue = this.callSuper();
        
        if (currentSuper === undefined)
          delete this.callSuper;
        else
          this.callSuper = currentSuper;
        
        return returnValue;
      };
    }
  }
];

