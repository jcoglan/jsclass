JS.Test.Reporters.extend({
  Progress: new JS.Class(JS.Test.Reporters.Dot, {
    startSuite: function(event) {
      if (!JS.Console.coloring())
        throw new Error('Cannot use the progress reporter; terminal formatting is not available');

      this._tests  = [];
      this._faults = [];
      this._size   = event.size;
 
      this.puts('\n\n\n');
    },

    startTest: function(event) {
      this._tests.push(event);
      this._draw();
    },

    endTest: function(event) {},

    addFault: function(event) {
      this._faults.push(event);
      this._draw();
    },

    endSuite: function(event) {
      this._passed = event.passed;
      this._draw();
      this.cursorPrevLine(1);
      this.callSuper();
    },

    _draw: function() {
      var cols     = JS.Console.getDimensions()[0] - 8,
          fraction = this._tests.length / this._size,
          test     = this._tests[this._tests.length - 1],
          blocks   = Math.floor(cols * fraction),
          left     = '',
          right    = '';

      var n = blocks;
      while (n--) left += ' ';
      n = cols - blocks;
      while (n--) right += ' ';

      this.cursorPrevLine(3);
      this.reset();
      this.print('  ');

      if (this._faults.length > 0)
        this.bgred();
      else if (this._passed)
        this.bggreen();
      else
        this.bgyellow();

      this.print(left);
      this.bgblack();
      this.puts(right);
      this.reset();
      this.eraseLine();

      if (this._passed === undefined)
        this.puts('  ' + test.fullName.replace(/\s+/g, ' ').substr(0, cols));

      this.puts('');
    } 
  })
});

JS.Test.Reporters.register('progress', JS.Test.Reporters.Progress);

