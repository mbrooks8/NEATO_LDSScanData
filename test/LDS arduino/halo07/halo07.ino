// Libraries
// Multiple versions of these libraries exist under the same name, but with different licenses.
// The libraries here are licensed under the "Creative Commons Attribution 3.0" license,
// which allows commercial use.
// Other versions of these libraries are licensed under GPL v2.
// The versions used here also contain performance optimizations.
#include <TimerOne.h>
#include <TimerThree.h>

// Debug and validation switches
#define LED0ON
#define LED1ON
#define LED2ON
#define LED3ON

//#define DEBUG_0_BRIGHT // Display degree 0 only, distance modulates brightness.
//#define DEBUG_0_90_ONLY  // Display degrees 0 & 90, full on, all other degrees off.
//#define DEBUG_0_90_BRIGHT  // Display degrees 0 & 90, distance modulates brightness.

#define FULL_ON_OFF_THRESHOLD 400 // All LED's either on or off, threshold distance in mm.

// LDS receive buffer
#define RXBUFF_SZ 22
#define START_CHAR 0xFA
#define INDEX_BYTE 1
#define INDEX_BIAS 0xA0
#define SPEED_L 2
#define SPEED_H 3
#define DATA_START 4
#define CKL 20
#define CKH 21

// LED definitions.
// I/O pins. LED's 0, 1, and 2 are driven by timer1 output-compare pins.
// LED 3 is driven by a timer3 output-compare pin.
#define LED0PIN 9
#define LED1PIN 10
#define LED2PIN 11
#define LED3PIN 5

// Display offsets.  These set the degree where each LED pointer starts.
// Tune LEDs 1,2, and 3 for good overlap.
#define LED0OFFSET 355  // nominal: 0
#define LED1OFFSET 260  // nominal: 270
#define LED2OFFSET 178  // nominal: 180
#define LED3OFFSET 87   // nominal: 90

// Time to display one degree, in microseconds = 200000 / 360
#define ONE_DEGREE 556

// LDS receive buffer
byte rxbuff[RXBUFF_SZ];
int packetchar = 0; // Incoming character.

// Display buffers and index pointers.
// Each angle's brightness is a byte that is translated to a PWM value
// via the bright2pwm lookup table.
// Two buffers implement simple double buffering, the display is one
// rotation behind the buffer being filled.
byte dispbuff0[360];
byte dispbuff1[360];
byte *fill = dispbuff0;
byte *disp = dispbuff1;
byte *dispindex = NULL; // Dummy display pointer used for synchronization.
byte *led0 = NULL;  // ledN are display pointers.
byte *led1 = NULL;
byte *led2 = NULL;
byte *led3 = NULL;
byte *buffend = NULL;
byte *buffstart = NULL;


//////////////////
// Initialization
void setup() {
  // Initialize Serial port for LDS
  Serial1.begin(115200, SERIAL_8N1);

  // Set LED pins for output.
  pinMode(LED0PIN, OUTPUT);
  pinMode(LED1PIN, OUTPUT);
  pinMode(LED2PIN, OUTPUT);
  pinMode(LED3PIN, OUTPUT);

  // Initialize 16 bit counters for driving LEDs.
  // The timers run one cycle per degree, so the timer completes 360
  // cycles in one revolution of the LDS.
  Timer1.initialize(ONE_DEGREE); // Set period.
  Timer3.initialize(ONE_DEGREE);
  Timer1.start(); // Start up the timers.
  Timer3.start();

  // Need to call pwm() once, then can use the faster setPwmDuty() thereafter.
  Timer1.pwm(LED0PIN, 512);
  Timer1.pwm(LED1PIN, 1);
  Timer1.pwm(LED2PIN, 1);
  Timer3.pwm(LED3PIN, 1);

}

/////////////////////

// Swap read and display buffers.
// Interrupts disabled so that counter interrupt doesn't pick up invalid pointers.
/*void swapbuffers() {
  noInterrupts();
  if (fill == dispbuff0) {
    fill = dispbuff1;
    dispindex = dispbuff0;
    led0 = dispbuff0 + LED0OFFSET;
    led1 = dispbuff0 + LED1OFFSET;
    led2 = dispbuff0 + LED2OFFSET;
    led3 = dispbuff0 + LED3OFFSET;
    buffstart = dispbuff0;
    buffend = dispbuff0 + 360;
  }
  else {
    fill = dispbuff0;
    dispindex = dispbuff1;
    led0 = dispbuff1 + LED0OFFSET;
    led1 = dispbuff1 + LED1OFFSET;
    led2 = dispbuff1 + LED2OFFSET;
    led3 = dispbuff1 + LED3OFFSET;
    buffstart = dispbuff1;
    buffend = dispbuff1 + 360;
  }
  interrupts();
}*/

// Compute checksum over receive buffer. Returns 'true' if packet is valid.
bool validpacket() {
  long chk32 = 0;
  unsigned int t  = 0;
  for (int i = 0; i < 20; i += 2) {
    t = rxbuff[i] + (unsigned int)(rxbuff[i + 1] << 8);
    chk32 = (chk32 << 1) + t;
  }
  int checksum = (chk32 & 0x7fff) + (chk32 >> 15);
  checksum = checksum & 0x7fff;
  return checksum == (rxbuff[CKL] | (rxbuff[CKH] << 8));
}


// Read one 4-degree packet from the LDS into rxbuff.
// Packet may not be valid; verify with validpacket().
void getpacket() {
  int rxp;
  bool insync = false;

  packetchar = Serial1.read();
  while (!insync) {
    while (packetchar != START_CHAR) {
      packetchar = Serial1.read();
      rxbuff[0] = packetchar;
    }
    packetchar = Serial1.read();
    while (packetchar < 0) packetchar = Serial1.read();
    rxbuff[INDEX_BYTE] = packetchar;
    insync = packetchar >= INDEX_BIAS;
  }
  //Serial.print(packetchar);
  rxp = 2;

  while (rxp < RXBUFF_SZ) {
    packetchar = Serial1.read();
    while (packetchar < 0) packetchar = Serial1.read();
    rxbuff[rxp] = packetchar;
    rxp++;
    //Serial.print(packetchar );
  }
}

int index() {
  return (rxbuff[INDEX_BYTE] - 0xA0);
}

int angle() {
  return index() << 2;
}

// returns distance in mm or a negative number on invalid data.
int dist(int n) {
  int v = n << 2;
  return (rxbuff[DATA_START + v]) | ((rxbuff[DATA_START + v + 1] & 0x9f) << 8);
}

int speed() {
  return   (rxbuff[SPEED_L] | (rxbuff[SPEED_H] << 8));
}

int d;
int a;
byte bright;
void loop() {

  getpacket();
 
    if (index() == 0) {
//      swapbuffers();
      //      Serial.println(bright2pwm[*(led0)]);
    }
    a = angle();

    for (int i = 0; i < 4; ++i, ++a) {

      d = dist(i);
      if (d > 200 && d < 400) {
        /*Left front bumper*/
        if (a > 0 && a <= 38) {
          Serial.print("LF");
          Serial.print(d);
          Serial.println();
        } else if ( a > 38 && a <= 50 ) {
          /*Side left bumper*/
          Serial.print("LS");
          Serial.print(d);
          Serial.println();

        } else if (a >= 330 && a < 360) {
          /*right front bumper*/
          Serial.print("RF");
          Serial.print(d);
          Serial.println();
        } else if (a >= 314 && a < 330) {
          /*right side bumper*/
          Serial.print("RS");
          Serial.print(d);
          Serial.println();
        }
      }
    }

}


