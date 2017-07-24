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
var fps = 20;
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

        console.log("Strip ready, let's go");

    });
});
    function firstThingIMade(){
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
    }

    function dynamicRainbow( delay ){
        console.log( 'dynamicRainbow' );

        var showColor;
        var cwi = 0; // colour wheel index (current position on colour wheel)
        var foo = setInterval(function(){
            if (++cwi > 255) {
                cwi = 0;
            }

            for(var i = 0; i < strip.length; i++) {
                showColor = colorWheel( ( cwi+i ) & 255 );
                strip.pixel( i ).color( showColor );
            }
            strip.show();
        }, 1000/delay);
    }

    // Input a value 0 to 255 to get a color value.
    // The colors are a transition r - g - b - back to r.
    function colorWheel( WheelPos ){
        var r,g,b;
        WheelPos = 255 - WheelPos;

        if ( WheelPos < 85 ) {
            r = 255 - WheelPos * 3;
            g = 0;
            b = WheelPos * 3;
        } else if (WheelPos < 170) {
            WheelPos -= 85;
            r = 0;
            g = WheelPos * 3;
            b = 255 - WheelPos * 3;
        } else {
            WheelPos -= 170;
            r = WheelPos * 3;
            g = 255 - WheelPos * 3;
            b = 0;
        }
        // returns a string with the rgb value to be used as the parameter
        return "rgb(" + r +"," + g + "," + b + ")";
    }
/*End arduino board*/
