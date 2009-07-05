/**
 * == test ==
 **/

JS.Test = new JS.Module('Test', {
  extend: {
    /** section: test
     * JS.Test.Unit
     * 
     * `JS.Test.Unit` is a (mostly) direct clone of Ruby's `Test::Unit`
     * framework. It provides support for writing unit tests that can
     * be run wherever you like, and ships with TestRunner UIs for command-line
     * use (V8, Rhino, SpiderMonkey) and for web browsers.
     * 
     * The original `Test::Unit` and all documentation contained here is
     * copyright (c) 2000-2003 Nathaniel Talbott. It is free software, and is
     * distributed under the Ruby license. See the `COPYING` file in the standard
     * Ruby distribution for details.
     * 
     * ### Usage
     *
     * The general idea behind unit testing is that you write a _test_
     * _method_ that makes certain _assertions_ about your code, working
     * against a _test_ _fixture_. A bunch of these _test_ _methods_ are
     * bundled up into a _test_ _suite_ and can be run any time the
     * developer wants. The results of a run are gathered in a _test_
     * _result_ and displayed to the user through some UI. So, lets break
     * this down and see how `JS.Test.Unit` provides each of these necessary
     * pieces.
     * 
     * ### Assertions
     * 
     * These are the heart of the framework. Think of an assertion as a
     * statement of expected outcome, i.e. "I assert that x should be equal
     * to y". If, when the assertion is executed, it turns out to be
     * correct, nothing happens, and life is good. If, on the other hand,
     * your assertion turns out to be false, an error is propagated with
     * pertinent information so that you can go back and make your
     * assertion succeed, and, once again, life is good. For an explanation
     * of the current assertions, see `JS.Test.Unit.Assertions`.
     * 
     * ### Test Method & Test Fixture
     * 
     * Obviously, these assertions have to be called within a context that
     * knows about them and can do something meaningful with their
     * pass/fail value. Also, it's handy to collect a bunch of related
     * tests, each test represented by a method, into a common test class
     * that knows how to run them. The tests will be in a separate class
     * from the code they're testing for a couple of reasons. First of all,
     * it allows your code to stay uncluttered with test code, making it
     * easier to maintain. Second, it allows the tests to be stripped out
     * for deployment, since they're really there for you, the developer,
     * and your users don't need them. Third, and most importantly, it
     * allows you to set up a common test fixture for your tests to run
     * against.
     * 
     * What's a test fixture? Well, tests do not live in a vacuum; rather,
     * they're run against the code they are testing. Often, a collection
     * of tests will run against a common set of data, also called a
     * fixture. If they're all bundled into the same test class, they can
     * all share the setting up and tearing down of that data, eliminating
     * unnecessary duplication and making it much easier to add related
     * tests.
     *
     * `JS.Test.Unit.TestCase` wraps up a collection of test methods together
     * and allows you to easily set up and tear down the same test fixture
     * for each test. This is done by overriding `JS.Test.Unit.TestCase#setup`
     * and/or `JS.Test.Unit.TestCase#teardown`,
     * which will be called before and after each test method that is
     * run. The `TestCase` also knows how to collect the results of your
     * assertions into a `JS.Test.Unit.TestResult`, which can then be reported
     * back to you... but I'm getting ahead of myself. To write a test,
     * follow these steps:
     *
     * * Create a class that subclasses `JS.Test.Unit.TestCase`.
     * * Add a method that begins with `test` to your class.
     * * Make assertions in your test method.
     * * Optionally define `setup` and/or `teardown` to set up and/or tear
     *   down your common test fixture.
     * * TODO describe how to run tests
     * 
     * A really simple test might look like this (`setup` and `teardown` are
     * commented out to indicate that they are completely optional):
     * 
     *     MyTest = new JS.Class('MyTest', JS.Test.Unit.TestCase, {
     *         // setup: function() {
     *         // },
     *         
     *         // teardown: function() {
     *         // },
     *         
     *         testFail: function() {
     *             this.assert(false, 'Assertion was false.');
     *         }
     *     });
     * 
     * ### Test Runners
     * 
     * So, now you have this great test class, but you still need a way to
     * run it and view any failures that occur during the run. This is
     * where `JS.Test.Unit.UI.Console.TestRunner` (and others, such as
     * `JS.Test.Unit.UI.Browser.TestRunner`) comes into play. To manually
     * invoke a runner, simply call its `run` class method and pass in an
     * object that responds to the `suite` message with a
     * `JS.Test.Unit.TestSuite`. This can be as simple as passing in your
     * `TestCase` class (which has a class `suite` method). It might look
     * something like this:
     * 
     *     JS.Test.Unit.UI.Console.TestRunner.run(MyTest);
     **/
    Unit: new JS.Module({
      extend: {
        AssertionFailedError: new JS.Class(Error, {
          initialize: function(message) {
            this.message = message.toString();
          }
        }),
        
        run: false
      }
    })
  }
});

