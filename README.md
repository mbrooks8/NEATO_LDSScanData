# NEATO_LDSScanData
Node.js controller for gathering and visualizing LDS scan data

# What you will need 
Nodejs installed on your desktop <br>
XAMPP to run a localhost <br>
Any recent type of Neato Botvac <br>
Scatter.js and chart.js

# Current features 
Send commands to the Botvac
Recieve data from the Botvac
Graph LDS Scan Data

# Setup 
On windows:<br>
just fill out the config file with the appropriate ip addresses and password. 

# extra setup 
if you want the messages to refresh on your desktop when you recieve a message you can use activator to run this command whenever you recieve a message. curl -X POST computersIPAdress:3000 -m 1