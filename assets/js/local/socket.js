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
        strip.off();
        strip.show();
    });
});

//GO TO localhost:3000 to view the website
server.listen(3000, function(){
    console.log('Neato LDS web controller is now online');
});
