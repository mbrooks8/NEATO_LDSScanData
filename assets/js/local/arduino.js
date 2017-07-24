/*arduino board*/

//ardino board stuff
var five = require("johnny-five"),
    board = new five.Board({
        port: "COM5",
        repl: false,
        debug: false,
    });

//LED STrip
pixel = require("node-pixel");
var strip = null;

// Create an Led
var ledSL;
var ledFL;
var ledFR;
var ledSR;

board.on("ready", function() {
    //Bumper LEDS
    console.log('Board Ready!!!'.white);
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

    // Define our led light strip
    // It's a 40px ring connected to pin 6.
    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [ {pin: 6, length: 40}, ],
        gamma: 2.8,
    });

    // Just like DOM-ready for web developers.
    strip.on("ready", function() {

        console.log('Strip Ready!!!'.white);
        // Set the entire strip to pink.
        strip.color('#903');

        // Set first and seventh pixels to turquoise.
        strip.pixel(0).color('#074');
        strip.pixel(10).color('#074');
        strip.pixel(20).color('#074');
        strip.pixel(30).color('#074');

        // Display initial state.
        strip.show();

        // Loop the following command forever
        // at 12fps until Arduino powers down.
        var loop = setInterval(function () {
            // Shift all pixels clockwise
            strip.shift(1, pixel.FORWARD, true);
            strip.show();
        }, 1000 / 12);
    });
});
/*End arduino board*/
