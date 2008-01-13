require 'rake'
require 'fileutils'

SOURCE_DIR = 'source'
PACKAGE_DIR = 'build'
PACKAGES = {
  'class' => 'class',
  'comparable' => 'comparable',
  'enumerable' => 'enumerable',
  'observable' => 'observable',
  'method_chain' => 'method_chain',
  'proxy' => 'proxy',
  
  'patterns' => %w(comparable enumerable observable method_chain proxy)
}

task :default => :build

task :build => [:create_directory, :destroy] do
  require 'packr'
  PACKAGES.each do |name, files|
    code = files.inject('') { |memo, source_file| memo << File.read("#{SOURCE_DIR}/#{source_file}.js") + "\n" }
    unless ENV['d']
      code = Packr.pack(code, :shrink_vars => true)
      base62 = Packr.pack(code, :base62 => true)
      code = base62 if code.size > base62.size
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
