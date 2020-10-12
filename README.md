To install on windows (this is what I did, other methods might work too):

Get VS Code: https://code.visualstudio.com/
Get GitForWindows: https://gitforwindows.org/
Get Ruby: https://rubyinstaller.org/ (download ruby + devkit)

clone this repository
open command line at repository root
I ran, but I don't think it is necessary: gem install jekyll bundler
issue: bundle install

I also needed to run as per https://github.com/oneclick/rubyinstaller2/issues/96:
gem uninstall eventmachine
gem install eventmachine --platform ruby

issue: bundle exec jekyll serve --livereload --open-url http://localhost:4000/

ctrl+c to close the local runner.