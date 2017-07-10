var express = require('express'); //This thing makes sending a starting html page to the user easy
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');


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

//dontchange this used to reset value of angle and lowest dist between runs
var lowestDist2 = 497;
var angle2      = 360;

//Initial value of lowest dist and angle
var lowestDist  = 497;
var angle       = 361;

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
                if (err) {return console.log('Error on write: ', err.message);}
            });
            toggled++;
        } else {
            //write to the robot and turn on LDSrotation
            port.write('setldsrotation off', function(err) {
                if (err) {return console.log('Error on write: ', err.message);}
            });
            toggled--;
        }

        //send enter key
        port.write('\r', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}
        });
    },

    getDistanceAndAngles: function(LDSScanData,lowestDist,angle,l){

        var tmp;
        while (l--) {
            tmp = LDSScanData[l].DistInMM;
            angle = LDSScanData[l].AngleInDegrees;

            /*everything else*/
            if (angle > 38 && angle < 322){
                tmp = tmp * 4.796;
            }

            /*Left front bumper*/
            if (angle > 0 && angle < 34){
                tmp = tmp - 335
            }

            /*left side bumper*/
            if (angle > 34 && angle < 38){
                tmp = tmp / 1.1639;
            }

            /*right front bumper*/
            if (angle > 326 && angle < 360){
                tmp = tmp - 335
            }

            /*right side bumper*/
            if (angle > 322 && angle < 326){
                tmp = tmp / 1.1639;
            }


            if (tmp < lowestDist){
                lowestDist = tmp;

                /*reset back to normal value*/
                if (angle > 38 && angle < 322){
                    lowestDist = lowestDist / 4.796;
                }

                /*Left front bumper*/
                if (angle > 0 && angle < 34){
                    lowestDist = lowestDist + 335;
                }

                /*left side bumper*/
                if (angle > 34 && angle < 38){
                    lowestDist = lowestDist * 1.1639;
                }

                /*right front bumper*/
                if (angle > 326 && angle < 360){
                    lowestDist = lowestDist + 335;
                }

                /*right side bumper*/
                if (angle > 322 && angle < 326){
                    lowestDist = lowestDist * 1.1639;
                }

            }
        }

        if (angle < 34 && angle >0){
            //trigger front right bumper
            thingToSend += "<p style='color:orange;'>" + lowestDist + "mm @" + angle + " Degrees trigger front left bumper</p>";
        } else if (angle <= 38){
            //trigger front left bumper
            thingToSend += "<p style='color:green;'>" + lowestDist + "mm @" + angle + " Degrees trigger side left bumper</p>";
        } else if (angle < 326 && angle >322){
            //trigger back left bumper
            thingToSend += "<p style='color:blue;'>" + lowestDist + "mm @" + angle + " Degrees trigger side right bumper</p>";
        } else if (angle < 360 && angle >326){
            //trigger back right bumper
            thingToSend += "<p style='color:black;'>" + lowestDist + "mm @" + angle + " Degrees trigger front right bumper</p>";
        } else {
            thingToSend += "<p style='color:red;'>" + lowestDist + "mm @" + angle + " ITS NOT TRIGGERING A BUMPER RIGHT NOW</p>";
        }

        persistantSocket.send(thingToSend);
        thingToSend = [];
    },

    getGraph: function(LDSScanData,l){
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
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('\r', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('setldsrotation off', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('\r', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
    },
}

var temp = new Array();
port.on('data', function (data) {
    counter++;
    temp = data.split(',');
    if(temp[3] == 0 && temp[1] <= lowestDist ){
        LDSScanData.push({
            "AngleInDegrees" : temp[0],
            "DistInMM" : temp[1]
        });
    }

    if(counter == 363){
        l = LDSScanData.length;
        module.exports.getDistanceAndAngles(LDSScanData,lowestDist,angle,l);

        module.exports.getGraph(LDSScanData,l);

        LDSScanData = [];
        counter = 0;
        angle = angle2;
        lowestDist = lowestDist2;
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

    socket.on('disconnect', function() {
        console.log('Got disconnect!');
    });
});

//GO TO localhost:3000 to view the website
server.listen(3000, function(){
    console.log('Neato LDS web controller is now online');
});
