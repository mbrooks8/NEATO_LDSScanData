# NEATO_LDSScanData
Node.js controller for gathering and visualizing LDS scan data

# What you will need 
Nodejs installed on your desktop https://nodejs.org/en/download/<br>
XAMPP to run a localhost https://www.apachefriends.org/download.html<br>
Any recent type of Neato Botvac https://tinyurl.com/ycgcewgp<br>
Scatter.js and chart.js included with files

# Current features 
Send commands to the Botvac though UART<br>
-- Recieve data from the Botvac<br>
-- Graph LDS Scan Data<br>
Virtual Bumper System<br>
-- Light indicator for activated bumpers<br>

# Whats next
Wireless UART commands<br>
Wireless arduino control<br>
faster data trasmission<br>

# Setup 
On windows:<br>
connect an arduino and the botvac to a laptop and modify variables.js to select the right COM ports being used<br>
Start XAMPP and start an Apache server<br>
open localhost on your computer<br>
open nodejs terminal and change your directory to the one with all of the files<br>
run npm start<br>
go to your browser and use the buttons to gather data<br>

# folder structure
Folder PATH listing for volume Windows<br>
Volume serial number is 00000094 1ADF:B2B9<br>
C:.<br>
³   .gitignore<br>
³   backupindex.js<br>
³   index.js<br>
³   index.min.js<br>
³   index.php<br>
³   koala-config.json<br>
³   LICENSE<br>
³   local.js<br>
³   package-lock.json<br>
³   package.json<br>
³   README.md<br>
³   tree.txt<br>
³   
ÃÄÄÄassets<br>
³   ÃÄÄÄjs<br>
³   ³   ÃÄÄÄindex<br>
³   ³   ³       functions.js<br>
³   ³   ³       <br>
³   ³   ÃÄÄÄlocal<br>
³   ³   ³       arduino.js<br>
³   ³   ³       functions.js<br>
³   ³   ³       port.js<br>
³   ³   ³       socket.js<br>
³   ³   ³       variables.js<br>
³   ³   ³       <br>
³   ³   ÀÄÄÄvendors<br>
³   ³           Chart.bundle.js<br>
³   ³           Chart.Core.min.js<br>
³   ³           Chart.Scatter.min.js<br>
³   ³           <br>
³   ÀÄÄÄtemplate<br>
³           botNav.php<br>
³           topNav.php<br>
³           <br>
ÀÄÄÄtest<br>
        test.js<br>
        