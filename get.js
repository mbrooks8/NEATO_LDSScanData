var toggled = 0;

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
    },

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

    getDistanceAndAngles: function(){

        for (i = 1; i < l - 2; i++) {
            if (LDSScanData[i].DistInMM > 125 && LDSScanData[i].DistInMM < 1000){

                thingToSend += "<p style='color:red;'>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>";
            }
            else{
                thingToSend += "<p>" + LDSScanData[i].DistInMM + "mm @" + LDSScanData[i].AngleInDegrees + " Degrees</p>";
            }
        }
        persistantSocket.send(thingToSend);

    },

    getGraph: function(){

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
        persistantSocket.emit('graph', pos);
        pos = [];
    },
}
