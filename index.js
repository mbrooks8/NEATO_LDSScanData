var express = require('express'); //This thing makes sending a starting html page to the user easy
var http = require('http');
var app = express();
var server = http.createServer(app);
var fs = require('fs');

//LDS Stuff
var counter = 0;
var LDSScanData = [];

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
port.on('open', function() {
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

});

// open errors will be emitted as an error event 
port.on('error', function(err) {
    console.log('Error: ', err.message);
});




module.exports = {

    tooClose: function(data){
        var contents = fs.readFileSync(data);
        var json = JSON.parse(contents);
        var thingToSend = [];
        for (i = 1; i < json.length - 1; i++) { 
            if (json[i].DistInMM > 500 && json[i].DistInMM < 1000){
                thingToSend += json[i].DistInMM + "mm @" + json[i].AngleInDegrees + " Degrees<br>"; 
            }
        }
        return thingToSend;
    },

    MakeLDSScanData: function(data){
        for (counter = 0; counter < 363; counter++){
            temp = data.split(',');
            if(temp[3] == 0 ){
                LDSScanData.push({
                    AngleInDegrees:temp[0],
                    DistInMM:temp[1],
                    Intensity:temp[2],
                    ErrorCodeHEX:temp[3]
                });
            }
            return LDSScanData;
        }
    },

    thingToSend: function(LDSScanData){
        var thingToSend = [];

        var l = LDSScanData.length;
        for (i = 1; i < l - 2; i++) {
            if (LDSScanData[i].DistInMM > 125 && LDSScanData[i].DistInMM < 1000){

                thingToSend += "<p style='color:red;'>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>";
            }
            else{
                thingToSend += "<p>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>";
            }
        }
    },

    graph: function(LDSScanData){
        var pos = [];
        var posX;
        var posY;
        //Calculate this outside so we dont need to do the math each time
        var PI_180 = (Math.PI/180);
        for (i = 0; i < l; i ++) {

            if(LDSScanData[i].DistInMM <= 1000 )
            {
                posX = LDSScanData[i].DistInMM * Math.sin(LDSScanData[i].AngleInDegrees * PI_180);
                posY = LDSScanData[i].DistInMM * Math.cos(LDSScanData[i].AngleInDegrees * PI_180);
                pos.push({
                    y: posY,
                    x: -posX
                });
            }
        }

        persistantSocket.send(thingToSend);
        persistantSocket.emit('graph', pos);
        LDSScanData = [];
        counter = 0;
        pos = [];
    }
} 

io.on('connection', function(socket){
    persistantSocket = socket;

    //When the client sends us something
    socket.on('runMyFunction', function(data){	

        var thingToSend = module.exports.tooClose("./data.json");
        socket.send(thingToSend);

    });

    var toggled = 0;
    socket.on('setldsrotation', function(data){

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

    });    

    socket.on('LDSScan', function(){

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
        //When I get data from the robot log that stuff
    });

    console.log("Website connected");
});
var temp = new Array();
port.on('data', function (data) {
    counter++;
    temp = data.split(',');
    if(temp[3] == 0 ){
        LDSScanData.push({
            AngleInDegrees:temp[0],
            DistInMM:temp[1],
            Intensity:temp[2],
            ErrorCodeHEX:temp[3]
        });
    }

    if(counter == 363){

        var thingToSend = [];

        var l = LDSScanData.length;
        for (i = 1; i < l - 2; i++) { 
            if (LDSScanData[i].DistInMM > 125 && LDSScanData[i].DistInMM < 1000){

                thingToSend += "<p style='color:red;'>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>"; 
            }
            else{
                thingToSend += "<p>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>"; 
            }
        }


        var pos = [];
        var posX;
        var posY;
        //Calculate this outside so we dont need to do the math each time
        var PI_180 = (Math.PI/180);
        for (i = 0; i < l; i ++) {

            if(LDSScanData[i].DistInMM <= 1000 )
            {
                posX = LDSScanData[i].DistInMM * Math.sin(LDSScanData[i].AngleInDegrees * PI_180);
                posY = LDSScanData[i].DistInMM * Math.cos(LDSScanData[i].AngleInDegrees * PI_180);
                pos.push({
                    y: posY,
                    x: -posX
                });
            }
        }

        persistantSocket.send(thingToSend);
        persistantSocket.emit('graph', pos);
        LDSScanData = [];
        counter = 0;
        pos = [];
    }
});


//GO TO localhost:3000 to view the website
server.listen(3000, function(){
    console.log('Neato LDS web controller is now online');
});
