JS.Packages(function() { with(this) {
    
    var cdn  = 'http://yui.yahooapis.com/';
    var yui  = cdn + '2.6.0/build/';
    
    file(yui + 'yahoo-dom-event/yahoo-dom-event.js')
    .defines( 'YAHOO',
              'YAHOO.lang',
              'YAHOO.util.Dom',
              'YAHOO.util.Event');
    
    pkg('YAHOO.util.Selector',      yui + 'selector/selector-beta-min.js');
    
    pkg('YAHOO.util.Connect',       yui + 'connection/connection-min.js');
    pkg('YAHOO.util.Get',           yui + 'get/get-min.js');
    
    file(yui + 'animation/animation-min.js')
    .defines( 'YAHOO.util.Anim',
              'YAHOO.util.ColorAnim')
    .requires('YAHOO',
              'YAHOO.util.Event');
    
    pkg('YAHOO.util.History',       yui + 'history/history-min.js');
    
    pkg('YAHOO.util.Selector')
        .requires('YAHOO')
        .requires('YAHOO.util.Anim')
        .requires('YAHOO.util.Connect');
    
    pkg('YAHOO.util.Connect')
        .requires('YAHOO');
}});

alert(window.YAHOO ? 'YUI version ' + YAHOO.VERSION : 'YAHOO not defined');

require('YAHOO.util.Anim', function() {});

require('YAHOO.util.Selector', function() {
    setTimeout(function() {
        alert('Using YAHOO.util.Selector: ' + YAHOO.util.Selector.query('td').length);
    }, 2000);
});

