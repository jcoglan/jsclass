Test.Reporters.extend({
  Dot: new JS.Class(Test.Reporters.Error, {
    SYMBOLS: {
      failure:  'F',
      error:    'E'
    },

    startTest: function(event) {
      this._outputFault = false;
    },

    addFault: function(event) {
      this._faults.push(event);
      if (this._outputFault) return;
      this._outputFault = true;
      this.consoleFormat('bold', 'red');
      this.print(this.SYMBOLS[event.error.type]);
      this.reset();
    },

    endTest: function(event) {
      if (this._outputFault) return;
      this.consoleFormat('green');
      this.print('.');
      this.reset();
    },

    endSuite: function(event) {
      this.puts('\n');

      for (var i = 0, n = this._faults.length; i < n; i++)
        this._printFault(i + 1, this._faults[i]);

      this._printSummary(event);
    }
  })
});

Test.Reporters.register('dot', Test.Reporters.Dot);

