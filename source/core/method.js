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

  apply: function(receiver, args) {
    return this.callable.apply(receiver, args);
  },

  compile: function(environment) {
    var method     = this,
        trace      = method.module.__trace__ || environment.__trace__,
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
    if (keywords.length === 0 && !trace) return callable;

    var compiled = function() {
      var N = keywords.length, j = N, previous = {}, keyword, existing, kwd;

      while (j--) {
        keyword  = keywords[j];
        existing = this[keyword.name];

        if (existing && !existing.__kwd__) continue;

        previous[keyword.name] = {
          _value: existing,
          _own:   this.hasOwnProperty(keyword.name)
        };
        kwd = keyword.filter(method, environment, this, arguments);
        if (kwd) kwd.__kwd__ = true;
        this[keyword.name] = kwd;
      }
      var returnValue = callable.apply(this, arguments),
          j = N;

      while (j--) {
        keyword = keywords[j];
        if (!previous[keyword.name]) continue;
        if (previous[keyword.name]._own)
          this[keyword.name] = previous[keyword.name]._value;
        else
          delete this[keyword.name];
      }
      return returnValue;
    };

    var StackTrace = trace && (exports.StackTrace || require('./stack_trace').StackTrace);
    if (trace) return StackTrace.wrap(compiled, method, environment);
    return compiled;
  },

  toString: function() {
    var name = this.displayName || (this.module.toString() + '#' + this.name);
    return '#<Method:' + name + '>';
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
  return (method instanceof this)
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

JS.Method.tracing = function(classes, block, context) {
  var pkg = exports.require ? exports : require('./loader');
  pkg.require('JS.StackTrace', function(StackTrace) {
    var logger = StackTrace.logger,
        active = logger.active;

    classes = [].concat(classes);
    this.trace(classes);
    logger.active = true;
    block.call(context);

    this.untrace(classes);
    logger.active = active;
  }, this);
};

JS.Method.trace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = true;
    classes[i].resolve();
  }
};

JS.Method.untrace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = false;
    classes[i].resolve();
  }
};
