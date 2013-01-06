Test.Reporters.extend({
  Progress: new JS.Class(Test.Reporters.Dot, {
    extend: {
      CACHE_TIME: 1000
    },

    startSuite: function(event) {
      if (!Console.coloring())
        throw new Error('Cannot use the progress reporter; terminal formatting is not available');

      this._tests  = [];
      this._faults = [];
      this._size   = event.size;
      this._space  = ' ';
      this._lines  = [''];

      var n = 10;
      while (n--) this._space = this._space + this._space;
 
      this.puts('\n\n\n');
      this.cursorHide();
    },

    startTest: function(event) {
      this._tests.push(event);

      var words = event.fullName.split(/\s+/),
          width = this._getWidth() - 10,
          lines = [],
          line  = '';

      while (words.length > 0) {
        while (words[0] && line.length + words[0].length + 1 <= width)
          line += words.shift() + ' ';

        if (words[0]) {
          lines.push(line);
          line = '';
        }
      }
      lines.push(line);

      while (lines.length < this._lines.length) lines.push('');
      this._nextLines = lines;
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
      this.cursorPrevLine(2);
      this.cursorShow();
      this.callSuper();
    },

    _draw: function() {
      var cols     = this._getWidth(),
          fraction = this._tests.length / this._size,
          test     = this._tests[this._tests.length - 1],
          blocks   = Math.floor(cols * fraction),
          percent  = String(Math.floor(100 * fraction)),
          line, i, n;

      this.cursorPrevLine(2 + this._lines.length);
      this.reset();
      this.print('  ');

      if (this._faults.length > 0)
        this.bgred();
      else if (this._passed)
        this.bggreen();
      else
        this.bgyellow();

      this.print(this._space.substr(0, blocks));
      this.bgblack();
      this.puts(this._space.substr(0, cols - blocks));
      this.reset();

      if (this._passed !== undefined) {
        this.eraseScreenForward();
        return this.puts('');
      }

      while (percent.length < 2) percent = ' ' + percent;
      percent = '[' + percent + '%]';
      this.cursorForward(2 + cols - percent.length);
      this.puts(percent);
      this.cursorPrevLine(1);

      this._lines = this._nextLines;
      for (i = 0, n = this._lines.length; i < n; i++) {
        line = this._lines[i];
        this.puts('  ' + line + this._space.substr(0, cols - line.length - 10));
      }

      this.puts('');
    },

    _getWidth: function() {
      var time = new Date().getTime();
      if (this._width && time < this._cacheTime + this.klass.CACHE_TIME)
        return this._width;

      this._cacheTime = new Date().getTime();
      return this._width = Console.getDimensions()[0] - 8;
    }
  })
});

Test.Reporters.register('progress', Test.Reporters.Progress);

