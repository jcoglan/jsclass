Test.Reporters.extend({
  XML: new JS.Class({
    include: Console,

    startSuite: function(event) {
      this._faults = [];
      this._stack  = [];
      this._suites = [];

      this.puts('<?xml version="1.0" encoding="UTF-8" ?>');
      this.puts('<testsuites>');
    },

    startContext: function(event) {
      if (event.context === null) return;
      if (this._stack.length === 0)
        this._suites.push({
          name: event.shortName,
          cases:    [],
          tests:    0,
          failures: 0,
          errors:   0,
          start:    new Date().getTime()
        });
      this._stack.push(event.shortName);
    },

    startTest: function(event) {
      this._suites[this._suites.length - 1].cases.push({
        name:     event.context.slice(1).concat(event.shortName).join(' '),
        start:    new Date().getTime(),
        failures: []
      });
    },

    addFault: function(event) {
      var suite = this._suites[this._suites.length - 1],
          test  = suite.cases[suite.cases.length - 1];

      if (event.error.type === 'failure') {
        suite.failures += 1;
        test.failures.push({type: 'Failure', error: event.error});
      } else if (event.error.type === 'error') {
        suite.errors += 1;
        test.failures.push({type: 'Error', error: event.error});
      }
    },

    endTest: function(event) {
      var suite = this._suites[this._suites.length - 1],
          test  = suite.cases[suite.cases.length - 1];

      test.time = (new Date().getTime() - test.start) / 1000;
      delete test.start;
    },

    endContext: function(event) {
      this._stack.pop();
      if (this._stack.length > 0) return;
      var suite = this._suites[this._suites.length - 1];
      suite.time = (new Date().getTime() - suite.start) / 1000;
      delete suite.start;

      var test, failure, ending, i, j, m, n;

      this.puts('    <testsuite name="' + this._xmlStr(suite.name) +
                             '" tests="' + suite.cases.length +
                             '" failures="' + suite.failures +
                             '" errors="' + suite.errors +
                             '" time="' + suite.time +
                             '">');

      for (i = 0, n = suite.cases.length; i < n; i++) {
        test   = suite.cases[i];
        ending = (test.failures.length === 0) ? ' />' : '>';
        this.puts('        <testcase classname="' + this._xmlStr(suite.name) +
                                  '" name="' + this._xmlStr(test.name) +
                                  '" time="' + test.time +
                                  '"' + ending);

        for (j = 0, m = test.failures.length; j < m; j++) {
          failure = test.failures[j];
          ending  = failure.error.backtrace ? '>' : ' />';
          this.puts('            <failure type="' + failure.type +
                                       '" message="' + this._xmlStr(failure.error.message) +
                                       '"' + ending);

          if (failure.error.backtrace) {
            this._printBacktrace(failure.error.backtrace);
            this.puts('            </failure>');
          }
        }
        if (test.failures.length > 0)
          this.puts('        </testcase>');
      }
      this.puts('    </testsuite>');
    },

    update: function(event) {},

    endSuite: function(event) {
      this.puts('</testsuites>');
    },

    _xmlStr: function(string) {
      return string.replace(/[\s\t\r\n]+/g, ' ')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;');
    },

    _printBacktrace: function(backtrace) {
      var lines = backtrace.replace(/^\s*|\s*$/g, '').split(/\s*[\r\n]+\s*/);
      for (var i = 0, n = lines.length; i < n; i++) {
        this.puts('                ' + this._xmlStr(lines[i]));
      }
    }
  })
});

Test.Reporters.register('xml', Test.Reporters.XML);
Test.Reporters.register('junit', Test.Reporters.XML);

