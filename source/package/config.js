JS.Packages(function() { with(this) {
    
    var PATH = JS.Package._env.JSCLASS_PATH ||
               __FILE__().replace(/[^\/]*$/g, '');
    
    var module = function(name) { return file(PATH + name + '.js') };
    
    module('core')          .provides('JS.Module',
                                      'JS.Class',
                                      'JS.Kernel',
                                      'JS.Singleton',
                                      'JS.Interface');
    
    module('comparable')    .provides('JS.Comparable')
                            .requires('JS.Module');
    
    module('constant_scope').provides('JS.ConstantScope')
                            .requires('JS.Module');
    
    module('forwardable')   .provides('JS.Forwardable')
                            .requires('JS.Module');
    
    module('enumerable')    .provides('JS.Enumerable')
                            .requires('JS.Module',
                                      'JS.Class');
    
    module('observable')    .provides('JS.Observable')
                            .requires('JS.Module');
    
    module('hash')          .provides('JS.Hash')
                            .requires('JS.Class',
                                      'JS.Enumerable',
                                      'JS.Comparable');
    
    module('range')         .provides('JS.Range')
                            .requires('JS.Class',
                                      'JS.Enumerable');
    
    module('set')           .provides('JS.Set',
                                      'JS.HashSet',
                                      'JS.SortedSet')
                            .requires('JS.Class',
                                      'JS.Enumerable')
                            .uses(    'JS.Hash');
    
    module('linked_list')   .provides('JS.LinkedList',
                                      'JS.LinkedList.Doubly',
                                      'JS.LinkedList.Doubly.Circular')
                            .requires('JS.Class',
                                      'JS.Enumerable');
    
    module('command')       .provides('JS.Command',
                                      'JS.Command.Stack')
                            .requires('JS.Class',
                                      'JS.Enumerable',
                                      'JS.Observable');
    
    module('decorator')     .provides('JS.Decorator')
                            .requires('JS.Module',
                                      'JS.Class');
    
    module('method_chain')  .provides('JS.MethodChain')
                            .requires('JS.Module',
                                      'JS.Kernel');
    
    module('proxy')         .provides('JS.Proxy',
                                      'JS.Proxy.Virtual')
                            .requires('JS.Module',
                                      'JS.Class');
    
    module('ruby')          .provides('JS.Ruby')
                            .requires('JS.Class');
    
    module('stack_trace')   .provides('JS.StackTrace')
                            .requires('JS.Module',
                                      'JS.Singleton');
    
    module('state')         .provides('JS.State')
                            .requires('JS.Module',
                                      'JS.Class');
}});

