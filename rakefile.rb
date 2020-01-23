require 'rake/clean'

GITHUB_TOKEN=ENV['GITHUB_TOKEN']
GITHUB_ACTOR='marcmo'
GITHUB_REPOSITORY='esrlabs/chipmunk-docs'
INPUT_GIT_COMMIT_MESSAGE="generated site content"
SITE='jekyll/_site'
DOCS='jekyll/_site/book'

CLEAN.include(SITE)

desc 'install'
task :install do
  sh "bundle install"
end

desc 'build jekyll site'
task :build_jekyll do
  cd 'jekyll' do
    sh 'bundle exec jekyll build'
  end
  sh "touch ./#{SITE}/.nojekyll"
end

desc 'build'
task :build => [SITE, DOCS]

desc 'build mdbook documentation'
task :book do
  cd "book" do
    sh 'mdbook build'
    mv 'book', "../#{DOCS}"
  end
end

desc 'python webserver'
task :pyweb do
  cd SITE do
    sh "python -m http.server 8888"
  end
end

file SITE => :build_jekyll
file DOCS => :book
