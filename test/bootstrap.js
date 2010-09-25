// A small set of tests designed to drive the writing
// of a new core until it's powerful enough to run all
// the JS.Test specs.

require('../build/min/core');
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
  }
});
var object = new Klass('jcoglan', 26);
assert.equal('jcoglan', object.name);
assert.equal(26, object.age);

sys.puts('Done.');
