JS.Class - Ruby-style JavaScript
===

http://jsclass.jcoglan.com

JS.Class is a JavaScript library for building object-oriented programs using Ruby
idioms. It implements Ruby's core object/module/class system in JavaScript, as well
as several standard Ruby libraries and various other extensions.


Distribution files
---

The distribution contains the following files:

* `core.js` - contains `Class`, `Module`, `Kernel`, `Singleton` and `Interface`
* `loader.js` - the `Package` system and dependency data for the core object
  system and the standard library.

The remaining files should be self-explanatory; each contains a single piece of the
standard library; see [the website](http://jsclass.jcoglan.com) for documentation.


Development
---

To hack on JS.Class you'll need to be able to build it and run the tests. You
need Ruby and Jake to do this:

  gem install jake
  cd path/to/js.class
  jake

This will build the project and create files in the `build` directory. To run the
tests, run the `test/console.js` script using any JavaScript interpreter, for
example:

  node test/console.js

Some interpreters will skip the tests that use asynchronous APIs, but the tests
should work using these JavaScript implementations:

  * Node
  * V8
  * Rhino
  * Narwhal
  * SpiderMonkey
  * Windows Script Host

To run the tests in a browser, just open the `test/browser.html` file.


License
---

Distributed under the MIT license.
Copyright (c) 2007-2010 James Coglan

