JS.Test.Reporters.extend({
  Spec: new JS.Class(JS.Test.Reporters.Dot, {
    extend: {
      TICK:   '\u2713',
      CROSS:  '\u2717'
    },

    startSuite: function(event) {
      this._faults = [];
      this._stack  = [];

      this.puts('');
    },

    startContext: function(event) {
      if (event.context === null) return;
      this.puts(this._indent(this._stack.length) + event.shortName);
      this._stack.push(event.shortName);
    },

    startTest: function(event) {
      this._testPassed = true;
    },

    addFault: function(event) {
      this._faults.push(event);
      this._testPassed = false;
    },

    endTest: function(event) {
      var indent = this._indent(this._stack.length),
          color  = this._testPassed ? 'green' : 'red',
          icon   = this._testPassed ? this.klass.TICK : this.klass.CROSS,
          number = this._testPassed ? '' : ' (' + this._faults.length + ')';

      this.consoleFormat(color);
      this.puts(indent + icon + number + ' ' + event.shortName);
      this.reset();
    },

    endContext: function(event) {
      if (event.context === null) return;
      this._stack.pop();
    },

    _indent: function(n) {
      var indent = '';
      while (n--) indent += '  ';
      return indent;
    }
  })
});

JS.Test.Reporters.register('spec', JS.Test.Reporters.Spec);

