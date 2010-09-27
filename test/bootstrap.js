// A small set of tests designed to drive the writing
// of a new core until it's powerful enough to run all
// the JS.Test specs.

require('../build/src/core');
var assert = require('assert'),
    sys    = require('sys');

var Klass = new JS.Class();
assert.ok(Klass instanceof Function);

var Klass = new JS.Class({
  initialize: function(name, age) {
    this.name = name;
    this.age  = age;
  }
});
var object = new Klass('jcoglan', 26);
assert.equal('jcoglan', object.name);
assert.equal(26, object.age);

var Klass = new JS.Class('Klass', {
  initialize: function(name, age) {
    this.name = name;
    this.age  = age;
  },
  sayHello: function() {
    return 'Hello, ' + this.name;
  }
});
var object = new Klass('jcoglan', 26);
assert.equal('jcoglan', object.name);
assert.equal(26, object.age);
assert.equal('Hello, jcoglan', object.sayHello());

var Sub = new JS.Class(Klass, {
  sayBye: function() {
    return 'Bye, ' + this.name;
  }
});
var object = new Sub('jcoglan', 26);
assert.equal('Hello, jcoglan', object.sayHello());
assert.equal('Bye, jcoglan', object.sayBye());

Klass.extend({
  classMethod: function() { return 'hi' }
});
assert.equal('hi', Klass.classMethod());
assert.equal('hi', Sub.classMethod());

Top = new JS.Class();
Top.extend(new JS.Module({ foo: function() { return 'foo' } }));
assert.equal('foo', Top.foo());
Bottom = new JS.Class(Top);
assert.equal('foo', Bottom.foo());

Foo = new JS.Module({ foo: function() { return 'hi' } });
Klass = new JS.Class();
object = new Klass();
assert.equal(undefined, object.foo);
Klass.include(Foo);
assert.equal('hi', object.foo());

Foo = new JS.Module();
Klass = new JS.Class();
object = new Klass();
Klass.include(Foo);
assert.equal(undefined, object.foo);
Foo.define('foo', function() { return 'hi' })
assert.equal('hi', object.foo());

JS.Module.define('talk', function() { return 'ohai' });
assert.equal('ohai', Klass.talk());
assert.equal('ohai', Foo.talk());
assert.equal('ohai', JS.Module.talk());
assert.equal('ohai', JS.Class.talk());

Klass = new JS.Class({
  extend: {
    foo: function() { return 'foo' }
  }
});
assert.equal('foo', Klass.foo());

sys.puts('Done.');
