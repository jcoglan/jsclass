JS.Packages(function() { with(this) {
    
    var JSCLASS_PATH = 'http://mydomain.com/path/to/jsclass/min/';
    
    file(JSCLASS_PATH + 'core.js')
        .provides('JS.Module', 'JS.Class', 'JS.Kernel', 'JS.Singleton', 'JS.Interface');
    
    file(JSCLASS_PATH + 'comparable.js')
        .provides('JS.Comparable')
        .requires('JS.Module');
    
    file(JSCLASS_PATH + 'constant_scope.js')
        .provides('JS.ConstantScope')
        .requires('JS.Module');
    
    file(JSCLASS_PATH + 'forwardable.js')
        .provides('JS.Forwardable')
        .requires('JS.Module');
    
    file(JSCLASS_PATH + 'enumerable.js')
        .provides('JS.Enumerable')
        .requires('JS.Module', 'JS.Class');
    
    file(JSCLASS_PATH + 'observable.js')
        .provides('JS.Observable')
        .requires('JS.Module');
    
    file(JSCLASS_PATH + 'hash.js')
        .provides('JS.Hash')
        .requires('JS.Class', 'JS.Enumerable', 'JS.Comparable');
    
    file(JSCLASS_PATH + 'set.js')
        .provides('JS.Set', 'JS.HashSet', 'JS.SortedSet')
        .requires('JS.Class', 'JS.Enumerable', 'JS.Hash');
    
    file(JSCLASS_PATH + 'linked_list.js')
        .provides('JS.LinkedList', 'JS.LinkedList.Doubly', 'JS.LinkedList.Doubly.Circular')
        .requires('JS.Class', 'JS.Enumerable');
    
    file(JSCLASS_PATH + 'command.js')
        .provides('JS.Command', 'JS.Command.Stack')
        .requires('JS.Class', 'JS.Enumerable', 'JS.Observable');
    
    file(JSCLASS_PATH + 'decorator.js')
        .provides('JS.Decorator')
        .requires('JS.Module', 'JS.Class');
    
    file(JSCLASS_PATH + 'method_chain.js')
        .provides('JS.MethodChain')
        .requires('JS.Module', 'JS.Kernel');
    
    file(JSCLASS_PATH + 'proxy.js')
        .provides('JS.Proxy', 'JS.Proxy.Virtual')
        .requires('JS.Module', 'JS.Class');
    
    file(JSCLASS_PATH + 'ruby.js')
        .provides('JS.Ruby')
        .requires('JS.Class');
    
    file(JSCLASS_PATH + 'stack_trace.js')
        .provides('JS.StackTrace')
        .requires('JS.Module', 'JS.Singleton');
    
    file(JSCLASS_PATH + 'state.js')
        .provides('JS.State')
        .requires('JS.Module', 'JS.Class');
}});

