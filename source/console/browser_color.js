Console.extend({
  BrowserColor: new JS.Class(Console.Browser, {
    COLORS: {
      green: 'limegreen'
    },

    __queue__: [],
    __state__: {},

    format: function(type, name) {
      name = name.replace(/^bg/, '');

      var state = JS.extend({}, this.__state__),
          color = this.COLORS[name] || name,
          no    = /^no/.test(name);

      if (type === 'reset')
        state = {};
      else if (no)
        delete state[type];
      else if (type === 'weight')
        state.weight = 'font-weight: ' + name;
      else if (type === 'style')
        state.style = 'font-style: ' + name;
      else if (type === 'underline')
        state.underline = 'text-decoration: underline';
      else if (type === 'color')
        state.color = 'color: ' + color;
      else if (type === 'background')
        state.background = 'background-color: ' + color;
      else
        state = null;

      if (state) {
        this.__state__ = state;
        this.__queue__.push(state);
      }
    },

    print: function(string) {
      this.__queue__.push(string)
    },

    puts: function(string) {
      this.print(string);
      var buffer = '', formats = [], item;
      while (item = this.__queue__.shift()) {
        if (typeof item === 'string') {
          buffer += '%c' + item;
          formats.push(this._serialize(this.__state__));
        } else {
          this.__state__ = item;
        }
      }
      console.log.apply(console, [buffer].concat(formats));
    },

    _serialize: function(state) {
      var rules = [];
      for (var key in state) rules.push(state[key]);
      return rules.join('; ');
    }
  })
});

