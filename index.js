var express = require('express'); //This thing makes sending a starting html page to the user easy
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');
var Promise = require("bluebird");


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

//read LDSStream from Robot
var SerialPort = require("serialport");
var port = new SerialPort("COM6", {
    baudRate: 115200,
    /*parser: SerialPort.parsers.raw*/
    parser: SerialPort.parsers.readline("\n")
});

module.exports = {

    getLDSScan: function(){
        //get new LDS scan data
        port.write('getldsscan', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
        //send enter key
        port.write('\r', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
    },

    setLDSRotation: function(){

        if (toggled == 0){
            //write to the robot and turn on LDSrotation
            port.write('setldsrotation on', function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
            });
            toggled++;
        } else {
            //write to the robot and turn on LDSrotation
            port.write('setldsrotation off', function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
            });
            toggled--;
        }

        //send enter key
        port.write('\r', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });

    },

    getDistanceAndAngles: function(LDSScanData){
        //Robot
        var pos2 = [];
        pos2.push({
            x:0,
            y:0
        });
        pos2.push({
            x:0,
            y:-55
        });
        pos2.push({
            x:0,
            y:245
        });
        pos2.push({
            x:-145,
            y:245
        });
        pos2.push({
            x:145,
            y:245
        });

        l = LDSScanData.length;
        var lowestDist = 500;
        var angle;

        var tmp;
        while (l--) {
            tmp = LDSScanData[l].DistInMM;

            if (LDSScanData[l].AngleInDegrees > 60 && LDSScanData[l].AngleInDegrees < 310){
                tmp = LDSScanData[l].DistInMM * 2.2;
            }


            if (tmp < lowestDist){
                lowestDist = tmp;
                angle = LDSScanData[l].AngleInDegrees;

                if (angle > 60 && angle < 310){
                    lowestDist = lowestDist / 2.2;
                }

            }
        }

        if (angle < 37.86 && angle >0){
            //trigger front right bumper
            thingToSend += "<p style='color:red;'>" + lowestDist + "mm @" + angle + " Degrees trigger front left bumper</p>";
        } else if (angle < 60){
            //trigger front left bumper
            thingToSend += "<p style='color:green;'>" + lowestDist + "mm @" + angle + " Degrees trigger side left bumper</p>";
        } else if (angle < 322.14 && angle >310){
            //trigger back left bumper
            thingToSend += "<p style='color:blue;'>" + lowestDist + "mm @" + angle + " Degrees trigger side right bumper</p>";
        } else if (angle < 360 && angle >322.14){
            //trigger back right bumper
            thingToSend += "<p style='color:black;'>" + lowestDist + "mm @" + angle + " Degrees trigger front right bumper</p>";
        } else {
            thingToSend += "<p style='color:orange;'>" + lowestDist + "mm @" + angle + " ITS BEHIND ME</p>";
        }

        persistantSocket.send(thingToSend);
        thingToSend = [];

    },

    getGraph: function(LDSScanData){
        l = LDSScanData.length;
        while(l--){


                posX = LDSScanData[l].DistInMM * Math.sin(LDSScanData[l].AngleInDegrees * PI_180);
                posY = LDSScanData[l].DistInMM * Math.cos(LDSScanData[l].AngleInDegrees * PI_180);
                pos.push({
                    y: posY,
                    x: -posX
                });

        }
        persistantSocket.emit('graph', pos);
        pos = [];
    },

    freshRobot: function(){

        port.write('testmode on', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
        port.write('\r', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
        port.write('setldsrotation off', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
        port.write('\r', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });

    },
}



var temp = new Array();
port.on('data', function (data) {
    counter++;
    temp = data.split(',');
    if(temp[3] == 0 && temp[1] <= 400 ){
        LDSScanData.push({
            "AngleInDegrees" : temp[0],
            "DistInMM" : temp[1]
        });
    }

    if(counter == 363){

        module.exports.getDistanceAndAngles(LDSScanData);

        module.exports.getGraph(LDSScanData);

        LDSScanData = [];
        counter = 0;

    }
});

//when you first open the connection to the port
port.on('open', function() {
    //turn off lds if it was on and set it to test mode
    module.exports.freshRobot();

});

// open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message);
});

io.on('connection', function(socket){
    persistantSocket = socket;


    socket.on('setldsrotation', function(data){
        //run setLDSRotation though the COM port
        module.exports.setLDSRotation();

    });

    socket.on('LDSScan', function(){

        //run getLDSScan though the COM port
        module.exports.getLDSScan();

    });

    console.log("Website connected");
});

//GO TO localhost:3000 to view the website
server.listen(3000, function(){
    console.log('Neato LDS web controller is now online');
});
