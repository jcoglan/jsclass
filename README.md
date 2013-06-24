# JS.Class - Ruby-style JavaScript

[http://jsclass.jcoglan.com](http://jsclass.jcoglan.com)

JS.Class is a JavaScript library for building object-oriented programs using
Ruby idioms. It implements Ruby's core object/module/class system in JavaScript,
as well as several standard Ruby libraries and various other extensions.


## Development

To hack on JS.Class you'll need to be able to build it and run the tests. To
build the library from source, run:

```
$ npm install
$ npm run-script build
```

This will build the project and create files in the `build` directory.


### Running the tests

To run the tests, you need to run several tasks. Make sure all the target server
platforms work:

```
$ JS=(v8 node phantomjs spidermonkey rhino narwhal ringo mongo)
$ for js in "${JS[@]}"; do echo "$js" ; $js test/console.js ; echo $? ; done
```

Some interpreters will skip the tests that use asynchronous APIs.

Check the tests work in the PhantomJS browser:

```
$ phantomjs test/phantom.js
```

Run the test suite in as many web browsers as you can:

```
$ open test/browser.html
```

For desktop application platforms, run it in XULRunner and AIR:

```
$ xulrunner -app test/xulenv/application.ini
$ adl test/airenv/app.xml
```


## License

Distributed under the MIT license.
Copyright (c) 2007-2013 James Coglan

