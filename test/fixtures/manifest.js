JS.Packages(function() { with(this) {
  file('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js')
    .provides('jQuery')
  
  file('/common.js')
    .provides('Common')
}})
