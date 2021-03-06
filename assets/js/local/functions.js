// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Usage!
sleep(500).then(() => {
    console.log("slept");
});

function bumperLight(){

    if(sl != 0){
        console.log("Side Left On");
        ledSL.on();
    } else if(sl == 0){
        ledSL.off();
    }

    /*if fl != 0 then it is being triggered*/
    if(fl != 0){
        console.log("Front Left On");
        ledFL.on();
    } else if(fl == 0){
        ledFL.off();
    }

    if(fr != 0){
        console.log("Front Right On");
        ledFR.on();
    } else if(fr == 0){
        ledFR.off();
    }

    if(sr != 0){
        console.log("Side Right On");
        ledSR.on();
    } else if(sr == 0){
        ledSR.off();
    }
    console.log("-----------------------------------".white);
}

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
        //check this fucntion
        greenRun(fps);
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
    /*Gets distance and angles from LDS data to trigger bumpers*/
    getDistanceAndAngles: function(LDSScanData,maxDist,angle,l,lowestDist){
        var tmp;

        /*theres like 360 things inside of LDSScanData*/
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

        /*turns on leds if any of the vlues of fl sl sr or fr are larger than 0 --> larger than 0 is triggering the bumper*/
        bumperLight();

        /*how long things are being triggered*/
        /*        bumperData += "Front Left: " + flTime + "<br>Side Left: " + slTime + "<br>Front Right: " + frTime + "<br>Side Right:" + srTime;*/

        /*Number of things being triggered*/
        thingToSend += "Front Left: " + fl + "<br>Side Left: " + sl + "<br>Front Right: " + fr + "<br>Side Right:" + sr;

        /*send Stuff*/
        persistantSocket.emit('bumper',thingToSend);

        /*Reset values*/
        thingToSend = [];
        sl=0;
        fl=0;
        fr=0;
        sr=0;
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
