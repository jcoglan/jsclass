JS.Console = new JS.Module('Console', {
  extend: {
    ANSI_CSI: String.fromCharCode(0x1B) + '[',
    MAX_BUFFER_LENGTH: 78,

    puts: function(string) {
      this._lineBuffer = '';
      this._printToStdout(string);
    },

    print: function(string) {
      if (typeof process === 'object') return require('sys').print(string);

      this._lineBuffer = this._lineBuffer || '';
      this._lineBuffer += string;

      var buffer = this._lineBuffer;

      while (buffer.length >= this.MAX_BUFFER_LENGTH) {
        var line = buffer.substr(0, this.MAX_BUFFER_LENGTH);
        buffer = buffer.substr(this.MAX_BUFFER_LENGTH);
        this.puts(line);
      }

      this._lineBuffer = buffer;
      if (this._lineBuffer === '') return;

      var esc = this._escapeCode('F') + this._escapeCode('K');
      this._printToStdout(esc + this._lineBuffer);
    },

    _printToStdout: function(string) {
      if (typeof process === 'object')    return require('sys').puts(string);
      if (typeof WScript !== 'undefined') return WScript.Echo(string);
      if (typeof print === 'function')    return print(string);
    },

    _escapeCode: function(string) {
      return this.ANSI_CSI + string;
    }
  }
});
