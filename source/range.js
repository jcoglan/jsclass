(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Hash = js.Hash || require('./hash').Hash;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Hash, E ? exports : js);

})(function(JS, Enumerable, Hash, exports) {
'use strict';

var Range = new JS.Class('Range', {
  include: Enumerable || {},

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

          Enumerable.forEach.call(this.SETS, function(name) {
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
      if (typeof object.succ === 'function') return object.succ();
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
    block = Enumerable.toFn(block);

    var needle  = this._first,
        exclude = this._excludeEnd;

    if (this.klass.compare(needle, this._last) > 0)
      return;

    var check = JS.isType(needle, Object)
        ? function(a,b) { return a.compareTo(b) < 0 }
        : function(a,b) { return a !== b };

    while (check(needle, this._last)) {
      block.call(context, needle);
      needle = this.klass.succ(needle);
      if (JS.isType(needle, 'string') && needle.length > this._last.length) {
        exclude = true;
        break;
      }
    }

    if (this.klass.compare(needle, this._last) > 0)
      return;

    if (!exclude) block.call(context, needle);
  },

  equals: function(other) {
    return JS.isType(other, Range) &&
           Enumerable.areEqual(other._first, this._first) &&
           Enumerable.areEqual(other._last, this._last) &&
           other._excludeEnd === this._excludeEnd;
  },

  hash: function() {
    var hash = Hash.codeFor(this._first) + '..';
    if (this._excludeEnd) hash += '.';
    hash += Hash.codeFor(this._last);
    return hash;
  },

  first: function() { return this._first },

  last:  function() { return this._last  },

  excludesEnd: function() { return this._excludeEnd },

  includes: function(object) {
    var a = this.klass.compare(object, this._first),
        b = this.klass.compare(object, this._last);

    return a >= 0 && (this._excludeEnd ? b < 0 : b <= 0);
  },

  step: function(n, block, context) {
    if (!block) return this.enumFor('step', n);
    block = Enumerable.toFn(block);

    var i = 0;
    this.forEach(function(member) {
      if (i % n === 0) block.call(context, member);
      i += 1;
    });
  },

  toString: function() {
    var str = this._first.toString() + '..';
    if (this._excludeEnd) str += '.';
    str += this._last.toString();
    return str;
  }
});

Range.extend({
  DIGITS:     new Range('0','9'),
  LOWERCASE:  new Range('a','z'),
  UPPERCASE:  new Range('A','Z'),
  SETS:       ['DIGITS', 'LOWERCASE', 'UPPERCASE']
});

Range.alias({
  begin:  'first',
  end:    'last',
  covers: 'includes',
  match:  'includes',
  member: 'includes'
});

exports.Range = Range;
});

