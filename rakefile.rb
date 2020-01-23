require 'rake/clean'

GITHUB_TOKEN=ENV['GITHUB_TOKEN']
GITHUB_ACTOR='marcmo'
GITHUB_REPOSITORY='esrlabs/chipmunk-docs'
INPUT_GIT_COMMIT_MESSAGE="generated site content"
SITE_DIR='jekyll/_site'
SITE="#{SITE_DIR}/index.html"
DOCS='jekyll/_site/book'

directory SITE_DIR
CLEAN.include(SITE_DIR)

desc 'install'
task :install do
  sh "bundle install"
end

desc 'build jekyll site'
task :build_jekyll do
  cd 'jekyll' do
    sh 'bundle exec jekyll build'
  end
  sh "touch ./#{SITE_DIR}/.nojekyll"
end

desc 'watch & serve jekyll site only'
task :watch_serve do
  cd 'jekyll' do
    sh 'bundle exec jekyll serve -l --baseurl='
  end
end

desc 'build'
task :build => [SITE, DOCS]

desc 'build mdbook documentation'
task :book => SITE_DIR do
  cd "book" do
    sh 'mdbook build'
    mv 'book', "../#{DOCS}"
  end
end

task :clean_docs do
  rm_r DOCS if Dir.exists?(DOCS)
end
desc 'python webserver'
task :preview_mdbook do
  cd 'book' do
    sh "mdbook serve"
  end
end

file SITE => :build_jekyll
file DOCS => :book
