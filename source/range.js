JS.Range = new JS.Class('Range', {
  include: JS.Enumerable || {},
  
  extend: {
    succ: function(object) {
      if (JS.isFn(object.succ)) return object.succ();
      if (JS.isType(object, 'string')) {
        if (object.length !== 1)
          throw new Error('Only single-character strings may be used in Ranges');
        return String.fromCharCode(object.charCodeAt(0) + 1);
      }
      if (JS.isType(object, 'number')) return object + 1;
      return null;
    }
  },
  
  initialize: function(first, last, excludeEnd) {
    this._first = first;
    this._last  = last;
    this._excludeEnd = !!excludeEnd;
  },
  
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    var needle = this._first;
    while (!JS.Enumerable.areEqual(needle, this._last)) {
      block.call(context || null, needle);
      needle = this.klass.succ(needle);
    }
    if (!this._excludeEnd) block.call(context || null, this._last);
  },
  
  equals: function(other) {
    return JS.isType(other, JS.Range) &&
           JS.Enumerable.areEqual(other._first, this._first) &&
           JS.Enumerable.areEqual(other._last, this._last) &&
           other._excludeEnd === this._excludeEnd;
  },
  
  hash: function() {
    var hash = JS.Hash.codeFor(this._first) + '..';
    if (this._excludeEnd) hash += '.';
    hash += JS.Hash.codeFor(this._last);
    return hash;
  },
  
  first: function() { return this._first },
  
  last:  function() { return this._last  },
  
  excludesEnd: function() { return this._excludeEnd },
  
  includes: function(object) {
    var result = false;
    this.forEach(function(member) {
      if (result || JS.Enumerable.areEqual(member, object))
        result = true;
    });
    return result;
  },
  
  step: function(n, block, context) {
    if (!block) return this.enumFor('step', n);
    var i = 0;
    this.forEach(function(member) {
      if (i % n === 0) block.call(context || null, member);
      i += 1;
    });
  }
});

JS.Range.include({
  begin:  JS.Range.instanceMethod('first'),
  end:    JS.Range.instanceMethod('last'),
  covers: JS.Range.instanceMethod('includes'),
  match:  JS.Range.instanceMethod('includes'),
  member: JS.Range.instanceMethod('includes')
});

