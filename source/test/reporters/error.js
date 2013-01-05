Test.Reporters.extend({
  Error: new JS.Class({
    include: Console,

    startSuite: function(event) {
      this._faults = [];

      this.consoleFormat('bold');
      this.puts('Loaded suite: ' + event.children.join(', '));
      this.puts('');
      this.reset();
      this.puts('Started');
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
      this.puts('');
      this.consoleFormat('bold', 'red');
      this.puts('\n' + index + ') ' + this.NAMES[fault.error.type] + ': ' + fault.test.fullName);
      this.reset();
      this.puts(fault.error.message);
      if (fault.error.backtrace) this.puts(fault.error.backtrace);
      this.reset();
    },

    _printSummary: function(event) {
      this.reset();
      this.puts('');
      this.puts('Finished in ' + event.runtime + ' seconds');

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

