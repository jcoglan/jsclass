JS.Packages(function() { with(this) {
    
    print(__FILE__());
    
    var path = __FILE__().replace(/[^\/]*$/g, '');
    
    file(path + 'fixtures.js')
        .provides('InheritanceTester')
        .requires('JS.Comparable',
                  'JS.Enumerable',
                  'JS.Observable',
                  'JS.Decorator',
                  'JS.State',
                  'JS.Proxy',
                  'JS.Forwardable',
                  'JS.Ruby');
}});

