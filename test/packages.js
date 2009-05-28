JS.Packages(function() { with(this) {
    
    var cdn  = 'http://yui.yahooapis.com/';
    var yui  = cdn + '2.7.0/build/';
    
    file(yui + 'yahoo-dom-event/yahoo-dom-event.js')
    .provides('YAHOO',
              'YAHOO.lang',
              'YAHOO.util.Dom',
              'YAHOO.util.Event');
    
    pkg('YAHOO.util.Selector',      yui + 'selector/selector-min.js');
    
    pkg('YAHOO.util.Connect',       yui + 'connection/connection-min.js')
        .requires('YAHOO');
    
    file(yui + 'animation/animation-min.js')
    .provides('YAHOO.util.Anim',
              'YAHOO.util.ColorAnim')
    .requires('YAHOO',
              'YAHOO.util.Event');
    
    pkg('YAHOO.util.History',       yui + 'history/history-min.js')
        .requires('YAHOO');
    
    pkg('YAHOO.util.Selector')
        .requires('YAHOO')
        .requires('YAHOO.util.Anim')
        .requires('YAHOO.util.Connect');
}});

alert(window.YAHOO ? 'YUI version ' + YAHOO.VERSION : 'YAHOO not defined');

require('YAHOO.util.Anim', 'YAHOO.util.History', function() {
    var H = YAHOO.util.History ? 'yes' : 'NO',
        A = YAHOO.util.Anim ? 'yes' : 'NO';
    alert( 'History: ' + H );
    alert( 'Animation: ' + A );
    
    require('YAHOO.util.Anim', 'YAHOO.util.History', function() {
        alert('All present');
    });
});

require('YAHOO.util.Selector', function() {
    setTimeout(function() {
        var n = YAHOO.util.Selector.query('li').length;
        alert('Using YAHOO.util.Selector: ' + n);
    }, 2000);
});

