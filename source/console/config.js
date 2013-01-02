(function() {
  var C = JS.Console;

  C.BROWSER = (typeof window !== 'undefined');
  C.NODE    = (typeof process === 'object');
  C.PHANTOM = (typeof phantom !== 'undefined');
  C.RHINO   = (typeof java !== 'undefined' && typeof java.lang !== 'undefined');
  C.WSH     = (typeof WScript !== 'undefined');

  if (C.BROWSER)    C.adapter = new C.Browser();
  else if (C.NODE)  C.adapter = new C.Node();
  else if (C.RHINO) C.adapter = new C.Rhino();
  else if (C.WSH)   C.adatper = new C.Windows();
  else              C.adapter = new C.Base();

  for (var key in C.ESCAPE_CODES) (function(key) {
    C.define(key, function() {
      JS.Console.adapter.format(key);
    });
  })(key);

  C.extend(C);
})();

