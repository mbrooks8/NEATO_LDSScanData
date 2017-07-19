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
