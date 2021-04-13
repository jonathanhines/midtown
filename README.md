To open a local copy that includes your saved but not-yet-pushed/committed changes, click on the folder C:\Users\chin_\Documents\GitHub\midtown and click on run.bat. Or open a run command (right click on the windows icon bottom left of the screen, select "run" and copy/paste: http://localhost:4000/). Save in Visual Studio (CNTRL S), refresh the local website (CTRL R), when finished, "Commit to Master"/Push. 

Before making changes, always PULL first (from Git hub. Top of screen, Repository: Pull)


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

Appointment Spreadsheet - Google Shared Documents

Thumbnails. Screen shot PDF to create jpg, upload to Git midtown folder. 
Thumbnails: 200px wide, jpg compression 50, aim for below 20kb
Medium Images: 600px wide, jpg compression 50 aim for below 100kb
Large and fullwidth images: 1200 px wide aim for below 200kb


Attachments. Link to doc in shared google drive. must be a publicly shared folder.