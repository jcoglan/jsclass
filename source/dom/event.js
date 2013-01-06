DOM.Event = {
  _registry: [],

  on: function(element, eventName, callback, context) {
    if (element !== DOM.ENV &&
        element.nodeType !== DOM.ELEMENT_NODE &&
        element.nodeType !== DOM.DOCUMENT_NODE)
      return;

    var wrapped = function() { callback.call(context, element) };

    if (element.addEventListener)
      element.addEventListener(eventName, wrapped, false);
    else if (element.attachEvent)
      element.attachEvent('on' + eventName, wrapped);

    this._registry.push({
      _element:   element,
      _type:      eventName,
      _callback:  callback,
      _context:   context,
      _handler:   wrapped
    });
  },

  detach: function(element, eventName, callback, context) {
    var i = this._registry.length, register;
    while (i--) {
      register = this._registry[i];

      if ((element    && element    !== register._element)   ||
          (eventName  && eventName  !== register._type)      ||
          (callback   && callback   !== register._callback)  ||
          (context    && context    !== register._context))
        continue;

      if (register._element.removeEventListener)
        register._element.removeEventListener(register._type, register._handler, false);
      else if (register._element.detachEvent)
        register._element.detachEvent('on' + register._type, register._handler);

      this._registry.splice(i,1);
      register = null;
    }
  }
};

DOM.Event.on(DOM.ENV, 'unload', DOM.Event.detach, DOM.Event);

