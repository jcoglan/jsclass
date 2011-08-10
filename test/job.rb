$SWARM        = "http://swarm.jcoglan.com"
$SWARM_INJECT = "/js/inject.js"
$USER         = "jsclass"
$AUTH_TOKEN   = "c986c98e2f75fed91a158a2591545d7a33a3e210"
$MAX_RUNS     = 5
$RCS_TYPE     = "git"
$RCS_URL      = "git://github.com/jcoglan/js.class.git"
$BASE_DIR     = "/home/jcoglan/www/swarm.jcoglan.com/app/changeset/#{$USER}"
$INJECT_FILE  = "test/browser.html"
$BUILD        = "rm -rf build && jake"
$JOB_NAME     = "JS.Class Commit \#{REV}"
$BROWSERS     = "all"
$SUITE        = "#{$SWARM}/changeset/#{$USER}/{REV}"

$SUITES = {}
[ 'Test.Unit',
  'Test.Context',
  'Test.Mocking',
  'Test.FakeClock',
  'Test.AsyncSteps',
  'Module',
  'Class',
  'Method',
  'Kernel',
  'Singleton',
  'Interface',
  'Command',
  'Comparable',
  'ConstantScope',
  'Decorator',
  'Enumerable',
  'Forwardable',
  'Hash',
  'LinkedList',
  'MethodChain',
  'Deferrable',
  'Observable',
  'Package',
  'Proxy',
  'Range',
  'Set',
  'State',
  'TSort'].
each do |spec|
  $SUITES[spec] = "#{$SUITE}/test/browser.html?spec=#{spec}Spec"
end

########### NO NEED TO CONFIGURE BELOW HERE ############

$DEBUG   = true
$curdate = Time.now.to_i
$co_dir  = "tmp-#{$curdate}"

def remove_tmp
  Dir.chdir($BASE_DIR)
  `rm -rf #{$co_dir}`
end

def clean(string)
  require 'cgi'
  CGI.escape(string.to_s.gsub(/{REV}/, $rev))
end

puts "mkdir -p #{$BASE_DIR}" if $DEBUG
`mkdir -p #{$BASE_DIR}`

puts "chdir #{$BASE_DIR}" if $DEBUG
Dir.chdir($BASE_DIR)

# Check out a specific revision
case $RCS_TYPE
  when "svn" then
    puts "svn co #{$RCS_URL} #{$co_dir}" if $DEBUG
    `svn co #{$RCS_URL} #{$co_dir}`
  when "git" then
    puts "git clone #{$RCS_URL} #{$co_dir}" if $DEBUG
    `git clone #{$RCS_URL} #{$co_dir}`
end

unless File.exists?($co_dir)
  raise "Problem checking out source."
end

puts "chdir #{$co_dir}" if $DEBUG
Dir.chdir($co_dir)

# Figure out the revision of the checkout
$rev = case $RCS_TYPE
  when "svn" then
    puts "svn info | grep Revision" if $DEBUG
    `svn info | grep Revision`.gsub(/Revision: /, '')
  when "git" then
    puts "git rev-parse --short HEAD" if $DEBUG
    `git rev-parse --short HEAD`
  else
    ""
end

$rev.strip!
puts "Revision: #{$rev}" if $DEBUG

if $rev.empty?
  remove_tmp
  raise "Revision information not found."
end

puts "chdir $BASE_DIR" if $DEBUG
Dir.chdir($BASE_DIR)

if File.exists?($rev)
  remove_tmp
  exit
end

puts "mv #{$co_dir} #{$rev}" if $DEBUG
`mv #{$co_dir} #{$rev}`

puts "chdir #{$rev}" if $DEBUG
Dir.chdir($rev)

if defined? $BUILD
  puts $BUILD if $DEBUG
  `#{$BUILD}`
end

Dir.glob($INJECT_FILE).each do |file|
  inject_file = `cat #{file}`
  
  # Inject the TestSwarm injection script into the test suite
  inject_file.gsub! /<\/head>/, %Q{<script>document.write("<scr" + "ipt src='#{$SWARM}#{$SWARM_INJECT}?" + (new Date).getTime() + "'><\/scr" + "ipt>");<\/script><\/head>}
  
  File.open(file, "w") { |f| f.write(inject_file) }
end

$props = {
  "state"     => "addjob",
  "output"    => "dump",
  "user"      => $USER,
  "auth"      => $AUTH_TOKEN,
  "job_name"  => $JOB_NAME,
  "max"       => $MAX_RUNS,
  "browsers"  => $BROWSERS
}

$query = ""

$props.each do |key, value|
  $query += "&" unless $query.empty?
  $query += "#{key}=#{clean value}"
end

$SUITES.each do |key, value|
  $query += "&suites[]=#{clean key}&urls[]=#{clean value}"
end

print "curl -d '#{$query}' #{$SWARM}" if $DEBUG
$results = `curl -d '#{$query}' #{$SWARM}`

if $results
  print "Results: #{$results}" if $DEBUG
  File.open("results.txt", "w") { |f| f.write "#{$SWARM}\n#{$results}" }
else
  raise "Job not submitted properly."
end

