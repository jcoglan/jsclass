Test.Reporters.extend({
  Error: new JS.Class({
    include: Console,

    NAMES: {
      failure:  'Failure',
      error:    'Error'
    },

    startSuite: function(event) {
      this._faults = [];
      this._start  = event.timestamp;

      this.consoleFormat('bold');
      this.puts('Loaded suite: ' + event.children.join(', '));
      this.reset();
      this.puts('');
    },

    startContext: function(event) {},

    startTest: function(event) {},

    addFault: function(event) {
      this._faults.push(event);
      this._printFault(this._faults.length, event);
    },

    update: function(event) {},

    endTest: function(event) {},

    endContext: function(event) {},

    endSuite: function(event) {
      this._printSummary(event);
    },

    _printFault: function(index, fault) {
      this.consoleFormat('bold', 'red');
      this.puts(index + ') ' + this.NAMES[fault.error.type] + ': ' + fault.test.fullName);
      this.reset();
      this.puts(fault.error.message);
      if (fault.error.backtrace) {
        this.grey();
        this.puts(fault.error.backtrace);
      }
      this.reset();
      this.puts('');
    },

    _printSummary: function(event) {
      var runtime = (event.timestamp - this._start) / 1000;
      this.reset();
      this.puts('Finished in ' + runtime + ' seconds');

      var color = event.passed ? 'green' : 'red';
      this.consoleFormat(color);
      this.puts(this._plural(event.tests, 'test') + ', ' +
                this._plural(event.assertions, 'assertion') + ', ' +
                this._plural(event.failures, 'failure') + ', ' +
                this._plural(event.errors, 'error'));
      this.reset();
      this.puts('');
    },

    _plural: function(number, noun) {
      return number + ' ' + noun + (number === 1 ? '' : 's');
    }
  })
});

Test.Reporters.register('error', Test.Reporters.Error);

