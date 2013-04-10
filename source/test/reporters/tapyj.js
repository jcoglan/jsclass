// http://rubydoc.info/github/rubyworks/tapout/file/TAP-YJ.md

Test.Reporters.extend({
  TAP_YJ: new JS.Class({
    STATUSES: {
      failure: 'fail',
      error:   'error'
    },

    startSuite: function(event) {
      this._write({
        type:  'suite',
        start: this._timestamp(),
        count: event.size,
        rev:   2
      });
      this._start = event.timestamp;
    },

    startContext: function(event) {
      this._write({
        type:  'case',
        label: event.shortName,
        level: event.context.length
      });
    },

    startTest: function(event) {
      this._faults = [];
      this._status = null;
    },

    addFault: function(event) {
      this._faults.push(event);
      this._status = this._status || this.STATUSES[event.error.type];
    },

    endTest: function(event) {
      var payload = {
        type:   'test',
        status: this._status || 'pass',
        label:  event.shortName,
        time:   this._ellapsedTime(event.timestamp)
      };

      var fault = this._faults[0];
      if (fault)
        payload.exception = {
          message:   fault.error.message,
          backtrace: fault.error.backtrace ? fault.error.backtrace.split('\n') : []
        };

      this._write(payload);
    },

    endContext: function(event) {},

    update: function(event) {},

    endSuite: function(event) {
      this._write({
        type: 'final',
        time: this._ellapsedTime(event.timestamp),
        counts: {
          total: event.tests,
          pass:  event.tests - event.failures - event.errors,
          fail:  event.failures,
          error: event.errors
        }
      });
    },

    _ellapsedTime: function(timestamp) {
      var diff = (timestamp - this._start) / 1000;
      return diff.toString().replace(/(\.\d{3}).*$/, '$1');
    },

    _write: function(object) {
      Console.puts(this._serialize(object));
    },

    _timestamp: function() {
      var date   = new JS.Date(),
          year   = date.getFullYear(),
          month  = this._pad(date.getMonth() + 1),
          day    = this._pad(date.getDay()),
          hour   = this._pad(date.getHours()),
          minute = this._pad(date.getMinutes()),
          second = this._pad(date.getSeconds());

      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    },

    _pad: function(value) {
      var string = value.toString();
      while (string.length < 2) string = '0' + string;
      return string;
    }
  })
});

Test.Reporters.extend({
  TAP_YAML: new JS.Class(Test.Reporters.TAP_YJ, {
    _serialize: function(value, level) {
      level = level || 0;

      var out = '';
      if (level === 0) out = '---';

      if      (value instanceof Array)    out += this._array(value, level);
      else if (typeof value === 'object') out += this._object(value, level);
      else if (typeof value === 'string') out += this._string(value, level);
      else if (typeof value === 'number') out += this._number(value, level);

      return out;
    },

    _array: function(value, level) {
      if (value.length === 0) return '[]';
      var out = '', indent = this._indent(level);
      for (var i = 0, n = value.length; i < n; i++) {
        out += '\n' + indent + '- ' + this._serialize(value[i], level + 1);
      }
      return out;
    },

    _object: function(object, level) {
      var out = '', indent = this._indent(level);
      for (var key in object) {
        if (!object.hasOwnProperty(key)) continue;
        out += '\n' + indent + key + ': ' + this._serialize(object[key], level + 1);
      }
      return out;
    },

    _string: function(string, level) {
      if (!/[\r\n]/.test(string))
        return '"' + string.replace(/"/g, '\\"') + '"';

      var lines  = string.split(/\r\n?|\n/),
          out    = '|',
          indent = this._indent(level);

      for (var i = 0, n = lines.length; i < n; i++) {
        out += '\n' + indent + lines[i];
      }
      return out;
    },

    _number: function(number, level) {
      return number.toString();
    },

    _indent: function(level) {
      var indent = '';
      while (level--) indent += '  ';
      return indent;
    }
  }),

  TAP_JSON: new JS.Class(Test.Reporters.TAP_YJ, {
    _serialize: function(value) {
      return JS.ENV.JSON ? JSON.stringify(value) : '';
    }
  })
});

var R = Test.Reporters;

R.register('tap/yaml', R.TAP_YAML);
R.register('tap/y',    R.TAP_YAML);
R.register('tap-yaml', R.TAP_YAML);
R.register('tap-y',    R.TAP_YAML);

R.register('tap/json', R.TAP_JSON);
R.register('tap/j',    R.TAP_JSON);
R.register('tap-json', R.TAP_JSON);
R.register('tap-j',    R.TAP_JSON);

