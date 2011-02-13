JS.Packages(function() { with(this) {
    
    // Debugging
    // JSCLASS_PATH = 'build/min/';
    
    var PATH = JS.Package.ENV.JSCLASS_PATH ||
               __FILE__().replace(/[^\/]*$/g, '');
    
    if (!/\/$/.test(PATH)) PATH = PATH + '/';
    
    var module = function(name) { return file(PATH + name + '.js') };
    
    module('core')          .provides('JS.Module',
                                      'JS.Class',
                                      'JS.Kernel',
                                      'JS.Singleton',
                                      'JS.Interface');
    
    var test = 'JS.Test.Unit';
    module('test')          .provides('JS.Test',
                                      'JS.Test.Context',
                                      'JS.Test.Mocking',
                                      'JS.Test.FakeClock',
                                      'JS.Test.AsyncSteps',
                                      'JS.Test.Helpers',
                                      test,
                                      test + '.Assertions',
                                      test + '.TestCase',
                                      test + '.TestSuite',
                                      test + '.TestResult')
                            .requires('JS.Module',
                                      'JS.Class',
                                      'JS.Console',
                                      'JS.DOM',
                                      'JS.Enumerable',
                                      'JS.SortedSet',
                                      'JS.Comparable',
                                      'JS.Ruby')
                            .styling(PATH + 'assets/testui.css');
    
    module('dom')           .provides('JS.DOM',
                                      'JS.DOM.Builder')
                            .requires('JS.Class');
    

    module('console')       .provides('JS.Console')
                            .requires('JS.Module');

    module('benchmark')     .provides('JS.Benchmark')
                            .requires('JS.Module')
                            .requires('JS.Console');
    
    module('comparable')    .provides('JS.Comparable')
                            .requires('JS.Module');
    
    module('constant_scope').provides('JS.ConstantScope')
                            .requires('JS.Module');
    
    module('forwardable')   .provides('JS.Forwardable')
                            .requires('JS.Module');
    
    module('enumerable')    .provides('JS.Enumerable')
                            .requires('JS.Module',
                                      'JS.Class');
    
    module('deferrable')    .provides('JS.Deferrable')
                            .requires('JS.Module');
    
    module('observable')    .provides('JS.Observable')
                            .requires('JS.Module');
    
    module('hash')          .provides('JS.Hash',
                                      'JS.OrderedHash')
                            .requires('JS.Class',
                                      'JS.Enumerable',
                                      'JS.Comparable');
    
    module('range')         .provides('JS.Range')
                            .requires('JS.Class',
                                      'JS.Enumerable');
    
    module('set')           .provides('JS.Set',
                                      'JS.HashSet',
                                      'JS.OrderedSet',
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
    
    module('tsort')         .provides('JS.TSort')
                            .requires('JS.Module')
                            .requires('JS.Class')
                            .requires('JS.Hash');
}});

