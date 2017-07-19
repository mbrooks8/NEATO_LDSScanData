# NEATO_LDSScanData
Node.js controller for gathering and visualizing LDS scan data

# What you will need 
Nodejs installed on your desktop https://nodejs.org/en/download/<br>
XAMPP to run a localhost https://www.apachefriends.org/download.html<br>
Any recent type of Neato Botvac https://tinyurl.com/ycgcewgp<br>
Scatter.js and chart.js included with files

# Current features 
Send commands to the Botvac though UART
-- Recieve data from the Botvac
-- Graph LDS Scan Data
Virtual Bumper System
-- Light indicator for activated bumpers

# Whats next
Wireless UART commands
Wireless arduino control
faster data trasmission

# Setup 
On windows:<br>
connect an arduino and the botvac to a laptop and modify variables.js to select the right COM ports being used
Start XAMPP and start an Apache server
open localhost on your computer
open nodejs terminal and change your directory to the one with all of the files
run npm start
go to your browser and use the buttons to gather data

# folder structure
Folder PATH listing for volume Windows
Volume serial number is 00000094 1ADF:B2B9
C:.
³   .gitignore
³   backupindex.js
³   index.js
³   index.min.js
³   index.php
³   koala-config.json
³   LICENSE
³   local.js
³   package-lock.json
³   package.json
³   README.md
³   tree.txt
³   
ÃÄÄÄassets
³   ÃÄÄÄjs
³   ³   ÃÄÄÄindex
³   ³   ³       functions.js
³   ³   ³       
³   ³   ÃÄÄÄlocal
³   ³   ³       arduino.js
³   ³   ³       functions.js
³   ³   ³       port.js
³   ³   ³       socket.js
³   ³   ³       variables.js
³   ³   ³       
³   ³   ÀÄÄÄvendors
³   ³           Chart.bundle.js
³   ³           Chart.Core.min.js
³   ³           Chart.Scatter.min.js
³   ³           
³   ÀÄÄÄtemplate
³           botNav.php
³           topNav.php
³           
ÀÄÄÄtest
        test.js
        