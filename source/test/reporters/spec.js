JS.Test.Reporters.extend({
  Spec: new JS.Class(JS.Test.Reporters.Dot, {
    startRun: function(event) {
      this._faults = [];
      this._stack  = [];
      
      this.puts('');
    },
    
    startSuite: function(event) {
      if (event.context === null) return;
      
      var stack   = this._stack,
          context = event.context,
          m       = 0;
      
      while (stack[m] && context[m] && stack[m] === context[m]) m += 1;
      
      for (var i = m, n = event.context.length; i < n; i++)
        this.puts(this._indent(i) + event.context[i]);
      
      this.puts(this._indent(event.context.length) + event.shortName);
      this._stack = event.context.concat(event.shortName);
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
          icon   = this._testPassed ? '\u2713' : '\u2717',
          number = this._testPassed ? '' : ' (' + this._faults.length + ')';
      
      this.consoleFormat(color);
      this.puts(indent + icon + number + ' ' + event.shortName);
      this.reset();
    },
    
    _indent: function(n) {
      var indent = '';
      while (n--) indent += '  ';
      return indent;
    }
  })
});

JS.Test.Reporters.register('spec', JS.Test.Reporters.Spec);

