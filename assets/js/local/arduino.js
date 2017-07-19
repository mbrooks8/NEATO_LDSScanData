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
