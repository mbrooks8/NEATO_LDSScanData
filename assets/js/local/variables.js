var express = require('express'); //This thing makes sending a starting html page to the user easy
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');
/*Facny collors*/
var colors = require('colors');


//LDS Stuff
var counter = 0;
var LDSScanData = [];

//this is for setldsrotation to toggle on and off with the button
var toggled = 0;
var DistInMM;

//this is for the angles and distances that is printed
var thingToSend = [];

//this is for  = LDSScanData.length;
var l;

//This is for my graph
var pos = [];
var posX;
var posY;
var PI_180 = (Math.PI/180);

//SENDING STUFF TO WEBSITE
var io = require('socket.io').listen(server);	//This makes sending and recieving data from the server easy
var persistantSocket;
app.use(express.static(__dirname + '/html'));	//Just tells the thing to use the current directory as the root page... I think
app.get('/', function(req, res){
    res.sendfile('./index.html');			//This is how you get it to send something to the browser
});

//Initial value of lowest dist and angle
var lowestDist  = 123 + 237;
var lowestAngle = 360;
var angle       = 360;
//Used to reset values of lowest dist and angle
var maxDist  = lowestDist;
var maxAngle = angle;

//bumper data timing stuff
var slTime = 0;
var flTime = 0;
var srTime = 0;
var frTime = 0;
var fl = 0;
var sl = 0;
var sr = 0;
var fr = 0;

//read LDSStream from Robot
var SerialPort = require("serialport");
/*serial port information*/
var port = new SerialPort("COM3", {
    baudRate: 115200,
    /*parser: SerialPort.parsers.raw*/
    parser: SerialPort.parsers.readline("\n")
});

var temp = new Array();
