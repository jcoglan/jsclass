JS.Range = new JS.Class('Range', {
  include: JS.Enumerable || {},
  
  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    },
    
    succ: function(object) {
      if (JS.isType(object, 'string')) {
        var chars = object.split(''),
            i     = chars.length,
            next  = null,
            set   = null,
            roll  = true;
        
        while (roll && i--) {
          next = null;
          
          JS.Enumerable.forEach.call(this.SETS, function(name) {
            var range = this[name];
            if (chars[i] !== range._last) return;
            set  = range;
            next = range._first;
          }, this);
          
          if (next === null) {
            next = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            roll = false;
          }
          chars[i] = next;
        }
        
        if (roll) chars.unshift( set._first === '0' ? '1' : set._first );
        
        return chars.join('');
      }
      
      if (JS.isType(object, 'number')) return object + 1;
      if (JS.isFn(object.succ)) return object.succ();
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
    block = JS.Enumerable.toFn(block);
    
    var needle  = this._first,
        reverse = (this.klass.compare(needle, this._last) > 0);
    
    if (!reverse && JS.isType(needle, 'string') && needle.length > this._last.length)
      return block.call(context || null, needle);
    
    if (reverse) return;
    
    while (!JS.Enumerable.areEqual(needle, this._last)) {
      block.call(context || null, needle);
      needle = this.klass.succ(needle);
    }
    if (!this._excludeEnd) block.call(context || null, needle);
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
    block = JS.Enumerable.toFn(block);
    
    var i = 0;
    this.forEach(function(member) {
      if (i % n === 0) block.call(context || null, member);
      i += 1;
    });
  }
});

JS.Range.extend({
  DIGITS:     new JS.Range('0','9'),
  LOWERCASE:  new JS.Range('a','z'),
  UPPERCASE:  new JS.Range('A','Z'),
  SETS: ['DIGITS', 'LOWERCASE', 'UPPERCASE']
});

JS.Range.include({
  begin:  JS.Range.instanceMethod('first'),
  end:    JS.Range.instanceMethod('last'),
  covers: JS.Range.instanceMethod('includes'),
  match:  JS.Range.instanceMethod('includes'),
  member: JS.Range.instanceMethod('includes')
});

