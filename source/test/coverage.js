Test.extend({
  Coverage: new JS.Class({
    initialize: function(module) {
      this._module = module;
      this._methods = new Hash([]);

      var storeMethods = function(module) {
        var methods = module.instanceMethods(false),
            i = methods.length;
        while (i--) this._methods.store(module.instanceMethod(methods[i]), 0);
      };
      storeMethods.call(this, module);
      storeMethods.call(this, module.__eigen__());
    },

    attach: function() {
      var module = this._module;
      StackTrace.addObserver(this);
      JS.Method.trace([module, module.__eigen__()]);
    },

    detach: function() {
      var module = this._module;
      JS.Method.untrace([module, module.__eigen__()]);
      StackTrace.removeObserver(this);
    },

    update: function(event, frame) {
      if (event !== 'call') return;
      var pair = this._methods.assoc(frame.method);
      if (pair) pair.setValue(pair.value + 1);
    },

    report: function() {
      var methods = this._methods.entries().sort(function(a,b) {
        return b.value - a.value;
      });
      var covered = this._methods.all(function(pair) { return pair.value > 0 });

      this.printTable(methods, function(row, i) {
        if (row[1] === 0) return ['bgred', 'white'];
        return (i % 2 === 0) ? ['bold'] : [];
      });
      return covered;
    },

    printTable: function(table, formatter) {
      var widths = [],
          table  = [['Method', 'Calls']].concat(table),
          C = Console,
          i = table.length,
          j, string;

      while (i--) {
        j = table[i].length;
        while (j--) {
          widths[j] = widths[j] || 0;
          string = (table[i][j] === undefined ? '' : table[i][j]).toString();
          widths[j] = Math.max(string.length, widths[j]);
        }
      }

      var divider = '+', j = widths.length;
      while (j--) divider = '+' + this.repeat('-', widths[j] + 2) + divider;
      divider = '  ' + divider;
      C.reset();
      C.puts();
      C.puts(divider);

      var printRow = function(row, format) {
        var data = table[row];
        C.reset();
        C.print('  ');
        for (var i = 0, n = data.length; i < n; i++) {
          C.reset();
          C.print('|');
          C.consoleFormat.apply(C, format);
          C.print(' ' + this.pad(data[i], widths[i]) + ' ');
        }
        C.reset();
        C.puts('|');
      };
      printRow.call(this, 0, ['bold']);
      C.reset();
      C.puts(divider);

      for (var i = 1, n = table.length; i < n; i++) {
        var format = formatter ? formatter(table[i], i) : [];
        printRow.call(this, i, format);
      }
      C.reset();
      C.puts(divider);
    },

    pad: function(string, width) {
      string = (string === undefined ? '' : string).toString();
      return string + this.repeat(' ', width - string.length);
    },

    repeat: function(string, n) {
      var result = '';
      while (n--) result += string;
      return result;
    }
  })
});
