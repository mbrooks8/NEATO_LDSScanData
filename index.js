var express = require('express'); //This thing makes sending a starting html page to the user easy
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');
/*Facny collors*/
var colors = require('colors');
var five = require("johnny-five"),
    board = new five.Board({
        port: "COM5",
        repl: false,
        debug: false,
    });

/*arduino board*/

// Create an Led
var ledSL;
var ledFL;
var ledFR;
var ledSR;

//code before the pause
setTimeout(function(){
    console.log("gimme a sec");
}, 2000);
board.on("ready", function() {
    console.log('lights ago!!!'.rainbow)
    // Side left pin on pin 8
    ledSL = new five.Led(8);
    // front left pin on pin 9
    ledFL = new five.Led(9);
    // Side right pin on pin 10
    ledFR = new five.Led(10);
    // front right pin on pin 11
    ledSR = new five.Led(11);
    //IDk why this needs to be here
    ledSL.off();
    ledFL.off();
    ledFR.off();
    ledSR.off();
});
/*End arduino board*/


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
/*serial port information*/
var port = new SerialPort("COM3", {
    baudRate: 115200,
    /*parser: SerialPort.parsers.raw*/
    parser: SerialPort.parsers.readline("\n")
});

//Initial value of lowest dist and angle
var lowestDist  = 113 + 237;
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
            //write to the robot and turn off LDSrotation
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

    getDistanceAndAngles: function(LDSScanData,maxDist,angle,l,lowestDist){

        var tmp;
        var fl = 0;
        var sl = 0;
        var sr = 0;
        var fr = 0;
        while (l--) {
            tmp = LDSScanData[l].DistInMM;
            angle = LDSScanData[l].AngleInDegrees;

            /*Left front bumper*/
            if (angle > 0 && angle <= 38){
                fl++;
            } else if( angle > 38 && angle <= 50 ){
                /*Side left bumper*/
                sl++;
            } else if(angle >= 330 && angle < 360){
                /*right front bumper*/
                fr++;
            } else if(angle >= 314 && angle < 330){
                /*right side bumper*/
                sr++;
            }
        }

        /*Some message to say if something is there*/
        if (fl != 0 || sl != 0 || sr !=0 || fr !=0){
            thingToSend += "<h1>Something's out there</h1>";
        } else{
            thingToSend += "<h1>Nothing</h1>";
        }


        if(sl != 0){
            ledSL.on();
        } else if(sl == 0){
            module.exports.ledSLOff();
        }
        /*if fl != 0 then it is being triggered*/
        if(fl != 0){
            ledFL.on();
        } else if(fl == 0){
            module.exports.ledFLOff();
        }
        if(fr != 0){
            ledFR.on();
        } else if(fr == 0){
            module.exports.ledFROff();
        }
        if(sr != 0){
            ledSR.on();
        } else if(sr == 0){
            module.exports.ledSROff();
        }
        /*how long things are being triggered*/
        /*        bumperData += "Front Left: " + flTime + "<br>Side Left: " + slTime + "<br>Front Right: " + frTime + "<br>Side Right:" + srTime;*/

        /*Number of things triggering*/
        thingToSend += "Front Left: " + fl + "<br>Side Left: " + sl + "<br>Front Right: " + fr + "<br>Side Right:" + sr;

        /*send Stuff*/
        persistantSocket.emit('bumper',thingToSend);

        /*Reset values*/
        thingToSend = [];
    },
    /*Front Left Start*/
    flStart: function(){
        timerInterval = setInterval(function(){
            ++flTime
            console.log(flTime);
        }, 1000);
    },

    /*Fuck this LED*/
    ledSLOff: function(){
        ledSL.off();
    },
    /*Fuck this LED*/
    ledFLOff: function(){
        ledFL.off();
    },
    /*Fuck this LED*/
    ledFROff: function(){
        ledFR.off();
    },
    /*Fuck this LED*/
    ledSROff: function(){
        ledSR.off();
    },

    /*sends graph to website*/
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
    /*resets robot*/
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
    /*the daya from the lds comes in single lines. there should be 361 lines from the get lds data command and two from the responses of the other commands that it runs i think..*/
    counter++;
    /*data comes in as (AngleInDegrees,DistInMM,Intensity,Error) I ignore all lines with an error and require a specific distance and angle to save. This saves some time when parsing though the LDSScanData later.*/
    temp = data.split(',');
    if(temp[3] == 0 && temp[1] <= maxDist && temp[1] >= 205){
        if(temp[0]<=50 || temp[0]>=314){
            /*I only save the angle in degrees and the distance in mm because thats all that is useful*/
            LDSScanData.push({
                "AngleInDegrees" : temp[0],
                "DistInMM" : temp[1]
            });
        }
    }

    if(counter == 363){
        l = LDSScanData.length;
        module.exports.getDistanceAndAngles(LDSScanData,maxDist,angle,l,lowestDist);
        //graphs the points. For some reason no matter what robot i use, the data on the right side is off by a bit.
        /* module.exports.getGraph(LDSScanData,l);*/

        /*reset everything back to the base values for next run*/
        LDSScanData = [];
        counter = 0;
        angle = maxAngle;
        lowestDist=maxDist;
    }
});

//when you first open the connection to the port
port.on('open', function() {
    console.log("Robot Online");
    //turn off lds if it was on and set it to test mode
    module.exports.freshRobot();

});

port.on('close', function() {
    console.log("Robot Offline");
});

// open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message);
});

io.on('connection', function(socket){
    persistantSocket = socket;
    module.exports.freshRobot();

    socket.on('setldsrotation', function(data){
        //run setLDSRotation though the COM port
        module.exports.setLDSRotation();

    });

    socket.on('LDSScan', function(){

        //run getLDSScan though the COM port
        module.exports.getLDSScan();

    });

    console.log("Website connected".green);

    socket.on('disconnect', function() {
        console.log('Website disconnect!'.red);
        port.write('setldsrotation off', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('\r', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('testmode off', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
        port.write('\r', function(err) {
            if (err) {return console.log('Error on write: ', err.message);}});
    });
});

//GO TO localhost:3000 to view the website
server.listen(3000, function(){
    console.log('Neato LDS web controller is now online');
});
