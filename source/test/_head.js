(function(factory) {
  var E  = (typeof exports === 'object'),
      js = E ? require('./core') : JS,

      Console     = (E ? require('./console') : js).Console,
      DOM         = (E ? require('./dom') : js).DOM,
      Enumerable  = (E ? require('./enumerable') : js).Enumerable,
      SortedSet   = (E ? require('./set') : js).SortedSet,
      Range       = (E ? require('./range') : js).Range,
      MethodChain = (E ? require('./method_chain') : js).MethodChain,
      Comparable  = (E ? require('./comparable') : js).Comparable,
      StackTrace  = (E ? require('./stack_trace') : js).StackTrace;

  if (E) exports.JS = exports;
  factory(js, Console, DOM, Enumerable, SortedSet, Range, MethodChain, Comparable, StackTrace, E ? exports : js);

})(function(JS, Console, DOM, Enumerable, SortedSet, Range, MethodChain, Comparable, StackTrace, exports) {

