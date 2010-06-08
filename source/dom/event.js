JS.DOM.Event = {
  _registry: [],
  
  on: function(element, eventName, callback, scope) {
    if (element !== JS.DOM.ENV &&
        element.nodeType !== JS.DOM.ELEMENT_NODE &&
        element.nodeType !== JS.DOM.DOCUMENT_NODE)
      return;
    
    var wrapped = function() { callback.call(scope, element) };
    
    if (element.addEventListener)
      element.addEventListener(eventName, wrapped, false);
    else if (element.attachEvent)
      element.attachEvent('on' + eventName, wrapped);
    
    this._registry.push({
      _element:   element,
      _type:      eventName,
      _callback:  callback,
      _scope:     scope,
      _handler:   wrapped
    });
  },
  
  detach: function(element, eventName, callback, scope) {
    var i = this._registry.length, register;
    while (i--) {
      register = this._registry[i];
      
      if ((element    && element    !== register._element)   ||
          (eventName  && eventName  !== register._type)      ||
          (callback   && callback   !== register._callback)  ||
          (scope      && scope      !== register._scope))
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

JS.DOM.Event.on(JS.DOM.ENV, 'unload', JS.DOM.Event.detach, JS.DOM.Event);

