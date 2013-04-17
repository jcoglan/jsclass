# JS.Class - Ruby-style JavaScript

[http://jsclass.jcoglan.com](http://jsclass.jcoglan.com)

JS.Class is a JavaScript library for building object-oriented programs using
Ruby idioms. It implements Ruby's core object/module/class system in JavaScript,
as well as several standard Ruby libraries and various other extensions.


## Development

To hack on JS.Class you'll need to be able to build it and run the tests. You
need Node.js and Ruby installed, then run:

    cd path/to/js.class
    npm install
    bundle install
    bundle exec jake

This will build the project and create files in the `build` directory.


### Running the tests

To run the tests, you need to run several tasks. Make sure all the target server
platforms work:

    $ JS=(v8 node phantomjs spidermonkey rhino narwhal ringo mongo)
    $ for js in "${JS[@]}"; do echo "$js" ; $js test/console.js ; echo $? ; done

Some interpreters will skip the tests that use asynchronous APIs.

Using Node.js, check that all the output formats work:

    $ FMT=(dot error json progress spec tap xml)
    $ for fmt in "${FMT[@]}" ; do node test/console.js -f $fmt ; done

Check the tests work in the PhantomJS browser. All the output formats should
work here too -- change the format by editing `test/phantom.js`.

    $ phantomjs test/phantom.js

Run the test suite in as many web browsers as you can:

    $ open test/browser.html

For desktop application platforms, run it in XULRunner and AIR:

    $ xulrunner -app test/xulenv/application.ini
    $ adl test/airenv/app.xml

Finally, JS.Class supports several distributed test environments, including
Buster.JS, Karma, Testem, Testling CI and TestSwarm. Here's how to test on
each platform; some of these require running commands in multiple terminals and
I've numbered the prompts to indicate this.

#### Buster.JS

    1 $ python -m SimpleHTTPServer 8000
    2 $ ./node_modules/.bin/buster-server
    3 $ open http://localhost:1111
    4 $ ./node_modules/.bin/buster-test

#### Karma

    1 $ python -m SimpleHTTPServer 8000
    2 $ ./node_modules/.bin/testacular start test/testacular.js
    3 $ open http://localhost:8080
    4 $ ./node_modules/.bin/testacular run

#### Testem

    1 $ ./node_modules/.bin/testem -f test/testem.json
    2 $ open http://localhost:7357

Tests should run automatically in all connected browsers when you edit files.

#### TestSwarm

TestSwarm integration requires a hosted server and is tested during the release
process.


## License

Distributed under the MIT license.
Copyright (c) 2007-2013 James Coglan

