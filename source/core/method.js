JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
    this.callable = callable;
    
    this._words = {};
    if (typeof callable !== 'function') return;
    
    this.arity  = callable.length;
    
    var matches = callable.toString().match(/\b[a-z\_\$][a-z0-9\_\$]*\b/ig),
        i       = matches.length;
    
    while (i--) this._words[matches[i]] = true;
  },
  
  setName: function(name) {
    this.callable.displayName =
    this.displayName = name;
  },
  
  contains: function(word) {
    return this._words.hasOwnProperty(word);
  },
  
  call: function() {
    return this.callable.call.apply(this.callable, arguments);
  },
  
  compile: function(environment) {
    var method     = this,
        callable   = method.callable,
        words      = method._words,
        allWords   = JS.Method._keywords,
        i          = allWords.length,
        keywords   = [],
        keyword;
    
    while  (i--) {
      keyword = allWords[i];
      if (words[keyword.name]) keywords.push(keyword);
    }
    if (keywords.length === 0) return callable;
    
    return function() {
      var N = keywords.length, j = N, previous = {}, keyword;
      
      while (j--) {
        keyword = keywords[j];
        previous[keyword.name] = {
          _value: this[keyword.name],
          _own:   this.hasOwnProperty(keyword.name)
        };
        keyword.filter.call(method, environment, this, arguments);
      }
      var returnValue = callable.apply(this, arguments),
          j = N;
      
      while (j--) {
        keyword = keywords[j];
        if (previous[keyword.name]._own)
          this[keyword.name] = previous[keyword.name]._value;
        else
          delete this[keyword.name];
      }
      return returnValue;
    };
  }
});

JS.Method.create = function(module, name, callable) {
  if (callable && callable.__inc__ && callable.__fns__)
    return callable;
  
  var method = (typeof callable !== 'function')
             ? callable
             : new this(module, name, callable);
  
  this.notify(method);
  return method;
};

JS.Method.compile = function(method, environment) {
  return method && method.compile
       ? method.compile(environment)
       : method;
};

JS.Method.__listeners__ = [];
  
JS.Method.added = function(block, context) {
  this.__listeners__.push([block, context]);
};
  
JS.Method.notify = function(method) {
  var listeners = this.__listeners__,
      i = listeners.length,
      listener;
  
  while (i--) {
    listener = listeners[i];
    listener[0].call(listener[1], method);
  }
};

JS.Method._keywords = [];

JS.Method.keyword = function(name, filter) {
  this._keywords.push({name: name, filter: filter});
};

