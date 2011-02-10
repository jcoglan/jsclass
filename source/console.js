JS.Console = new JS.Module('JS.Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,

    puts: function(string) {
      this._lineBuffer = [];
      this._printToStdout(string);
    },

    print: function(string) {
      if (typeof process === 'object') return require('sys').print(string);

      this._lineBuffer = this._lineBuffer || [];
      if (this._lineBuffer.length >= this.MAX_BUFFER_LENGTH)
        this._lineBuffer = [];

      var esc = (this._lineBuffer.length === 0) ? '' : this._escape('F') + this._escape('K');
      this._lineBuffer.push(string);
      this._printToStdout(esc + this._lineBuffer.join(''));
    },

    _printToStdout: function(string) {
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    },

    _escape: function(string) {
      return this.ANSI_CSI + string;
    }
  }
});
