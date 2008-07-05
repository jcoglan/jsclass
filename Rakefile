require 'rake'
require 'fileutils'

SOURCE_DIR = 'source'
PACKAGE_DIR = 'build'
PACKAGES = {
  'class' => 'class',
  'comparable' => 'comparable',
  'enumerable' => 'enumerable',
  'observable' => 'observable',
  'forwardable' => 'forwardable',
  'method_chain' => 'method_chain',
  'decorator' => 'decorator',
  'proxy' => 'proxy',
  'command' => 'command',
  'state' => 'state',
  'linked_list' => 'linked_list',
  'ruby' => 'ruby',
  
  'patterns' => %w(
    comparable enumerable observable forwardable
    method_chain decorator proxy command state
    linked_list ruby
  )
}

task :default do
  if ENV['q']
    Rake::Task[:grape].invoke
  else
    Rake::Task[:build].invoke
  end
end

task :build => [:create_directory, :destroy] do
  require 'packr'
  PACKAGES.each do |name, files|
    code = files.inject('') { |memo, source_file| memo << File.read("#{SOURCE_DIR}/#{source_file}.js") + "\n" }
    unless ENV['d']
      code = Packr.pack(code, :shrink_vars => true)
      unless ENV['gzip']
        base62 = Packr.pack(code, :base62 => true)
        code = base62 if code.size > base62.size
      end
    end
    filename = "#{PACKAGE_DIR}/#{name}.js"
    File.open(filename, 'wb') { |f| f.write code }
    puts "\n  Built package '#{name}': #{(File.size(filename)/1000).to_i} kb"
    files.each { |source_file| puts "    - #{source_file}" }
  end
end

task :create_directory do
  FileUtils.mkdir_p(PACKAGE_DIR) unless File.directory?(PACKAGE_DIR)
end

task :destroy do
  PACKAGES.each do |name, files|
    file = "#{PACKAGE_DIR}/#{name}.js"
    File.delete(file) if File.file?(file)
  end
end

desc "Searches all project files and lists those whose contents match the regexp"
task :grape do
  require 'grape'
  grape = Grape.new(:dir => '.', :excluded_dirs => %w(build releases),
      :extensions => %w(js html haml))
  results = grape.search(ENV['q'],
    :case_sensitive => !!ENV['cs'],
    :verbose => !!ENV['v'],
    :window => ENV['v']
  )
  grape.print_results(results)
end
