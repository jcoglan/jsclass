# Contributing to `jsclass`

The `jsclass` git repository is at http://github.com/jcoglan/jsclass.

To hack on `jsclass` you'll need to be able to build it and run the tests. To
build the library from source, run:

```
$ npm install
$ npm run-script build
```

This will build the project and create files in the `build` directory.


## Running the tests

Please add tests for any functionality you add to the library. The test files
live in the `test/specs` directory; follow the code conventions you see in the
existing files.

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

