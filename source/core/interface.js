/** section: core
 * class JS.Interface
 * 
 * `Interface` is a class used to encapsulate sets of methods and check whether objects
 * implement them. Think of interfaces as a means of duck-typing rather than as they are
 * used in Java.
 **/
JS.Interface = new JS.Class({
  /**
   * new JS.Interface(methods)
   * - methods (Array): a list of method names
   * 
   * An `Interface` is instantiated using a list of method names; these methods are the
   * API the interface can be used to check for.
   * 
   *     var HistoryInterface = new JS.Interface([
   *         'getInitialState',
   *         'changeState'
   *     ]);
   **/
  initialize: function(methods) {
    this.test = function(object, returnName) {
      var n = methods.length;
      while (n--) {
        if (!JS.isFn(object[methods[n]]))
          return returnName ? methods[n] : false;
      }
      return true;
    };
  },
  
  /**
   * JS.Interface#test(object[, returnName = false]) -> Boolean | String
   * - object (Object): object whose API we wish to check
   * - returnName (Boolean): if true, return the first name found to be missing
   * 
   * Checks whether `object` implements the interface, returning `true` or `false`. If
   * the second argument is `true`, returns the name of the first method found to be
   * missing from the object's API.
   **/
  
  extend: {
    /**
     * JS.Interface.ensure(object, iface1[, iface2]) -> undefined
     * - object (Object): object whose API we wish to check
     * - iface (JS.Interface): interface the object should implement
     * 
     * Throws an `Error` unless `object` implements the required interface(s).
     **/
    ensure: function() {
      var args = JS.array(arguments), object = args.shift(), face, result;
      while (face = args.shift()) {
        result = face.test(object, true);
        if (result !== true) throw new Error('object does not implement ' + result + '()');
      }
    }
  }
});

