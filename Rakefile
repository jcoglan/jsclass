require 'rake'
require 'fileutils'

SOURCE_DIR = '.'
PACKAGE_DIR = 'build'
PACKAGES = {
  'class' => 'class'
}

task :default => :build

task :build => [:create_directory, :destroy] do
  require 'packr'
  PACKAGES.each do |name, files|
    code = files.inject('') { |memo, source_file| memo << File.read("#{SOURCE_DIR}/#{source_file}.js") + "\n" }
    code = Packr.pack(code, :shrink => true, :privates => true) unless ENV['d']
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
