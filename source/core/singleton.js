/** section: core
 * class JS.Singleton
 * 
 * Singleton is a class used to construct custom objects with all the inheritance features
 * of JS.Class, the methods from Kernel, etc. It constructs an anonymous class from the
 * objects you provide and returns an instance of this class.
 **/
JS.Singleton = new JS.Class({
  /**
   * new JS.Singleton(parent, methods)
   **/
  initialize: function(parent, methods) {
    return new (new JS.Class(parent, methods));
  }
});

