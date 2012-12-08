(function() {
  var candidates = [  JS.Package.XULRunnerLoader,
                      JS.Package.RhinoLoader,
                      JS.Package.CommonJSLoader,
                      JS.Package.DomLoader,
                      JS.Package.ServerLoader,
                      JS.Package.WshLoader ],

      n = candidates.length,
      i, candidate;

  for (i = 0; i < n; i++) {
    candidate = candidates[i];
    if (candidate.usable()) {
      JS.Package.Loader = candidate;
      if (candidate.setup) candidate.setup();
      break;
    }
  }
})();

