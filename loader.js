JSCLASS_PATH = 'build/min/';
load(JSCLASS_PATH + 'loader.js');

load('test/fixtures/config.js');

require('InheritanceTester', function() {
    print(InheritanceTester);
});

