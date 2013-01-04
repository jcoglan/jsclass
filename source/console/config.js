Console.BROWSER = (typeof window !== 'undefined');
Console.NODE    = (typeof process === 'object');
Console.PHANTOM = (typeof phantom !== 'undefined');
Console.RHINO   = (typeof java !== 'undefined' && typeof java.lang !== 'undefined');
Console.WSH     = (typeof WScript !== 'undefined');

if (Console.BROWSER)    Console.adapter = new Console.Browser();
else if (Console.NODE)  Console.adapter = new Console.Node();
else if (Console.RHINO) Console.adapter = new Console.Rhino();
else if (Console.WSH)   Console.adapter = new Console.Windows();
else                    Console.adapter = new Console.Base();

for (var key in Console.ESCAPE_CODES) (function(key) {
  Console.define(key, function() {
    Console.adapter.format(key);
  });
})(key);

Console.extend(Console);

