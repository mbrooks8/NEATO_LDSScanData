// Libraries
// Multiple versions of these libraries exist under the same name, but with different licenses.
// The libraries here are licensed under the "Creative Commons Attribution 3.0" license,
// which allows commercial use.
// Other versions of these libraries are licensed under GPL v2.
// The versions used here also contain performance optimizations.
#include <TimerOne.h>
#include <TimerThree.h> // used for ultrasonic PWM motor control
#include <PID.h>
#include <EEPROM.h>
#include <EEPROMAnything.h>
#include <SerialCommand.h>

int rxPin = 0;
int txPin = 1;
char ldsData;

// LDS receive buffer
#define packet 22 //the lds sends a continuous stream of 22 bytpe packets at 115200 baud.
#define startOfPacket 0xFA // 0xFA is the start of the packet (FB-FF is reserved for future formats)
#define indexByte 1
#define indexBias 0xA0
#define speedL 2
#define speedH 3
#define dataStart 4
#define CKL 20
#define CKH 21
//  RXBUFF_SZ is packet
// START_CHAr is startOfPacket
byte packetBuffer[packet];
int packetChar = 0; // Incoming character.

// Time to display one degree, in microseconds = 200000 / 360
#define ONE_DEGREE 556

//////////////////
// Initialization
void setup() {
  // Initialize Serial port for LDS
  Serial.begin(115200, SERIAL_8N1);              // ...set up the serial ouput in 0004 format

  // Initialize 16 bit counters for driving LEDs.
  // The timers run one cycle per degree, so the timer completes 360
  // cycles in one revolution of the LDS.
  Timer1.initialize(ONE_DEGREE); // Set period.
  Timer3.initialize(ONE_DEGREE);
  Timer1.start(); // Start up the timers.
  Timer3.start();

  pinMode(rxPin, INPUT);
  pinMode(txPin, OUTPUT);
  ldsData = Serial.read();
  Serial.print(ldsData, BIN);

}

// Read one 4-degree packet from the LDS into rxbuff.
// Packet may not be valid; verify with validpacket().
void getpacket() {
  int rxp;
  bool insync = false;

  packetChar = Serial1.read();
  while (!insync) {
    while (packetChar != startOfPacket) {
      packetChar = Serial1.read();
      packetBuffer[0] = packetChar;
    }
    packetChar = Serial1.read();
    while (packetChar < 0) packetChar = Serial1.read();
    packetBuffer[indexByte] = packetChar;
    insync = packetChar >= indexBias;
  }
  rxp = 2;

  while (rxp < packet) {
    packetChar = Serial1.read();
    while (packetChar < 0) packetChar = Serial1.read();
    packetBuffer[rxp] = packetChar;
    rxp++;
  }
}

//index byte is the starting angle for the data payload (0xA0-0xF9)
//Real angle = (index - 0xA0) *4
int index() {
  return (packetBuffer[indexByte]-0xA0);
}

int angle() {
  return index() << 2;
}

// returns distance in mm or a negative number on invalid data.
int dist(int n) {
  int v = n << 2;
  return (packetBuffer[dataStart + v]) | ((packetBuffer[dataStart + v + 1] & 0x9f)<<8);
}

int speed() {
  return   (packetBuffer[speedL] | (packetBuffer[speedH]<<8));
}

// Compute checksum over receive buffer. Returns 'true' if packet is valid.
bool validpacket() {
  long chk32 = 0;
  unsigned int t  = 0;
  for (int i = 0; i < 20; i += 2) {
    t = packetBuffer[i] + (unsigned int)(packetBuffer[i + 1] << 8);
    chk32 = (chk32 << 1) + t;
  }
  int checksum = (chk32 & 0x7fff) + (chk32 >> 15);
  checksum = checksum & 0x7fff;
  return checksum == (packetBuffer[CKL] | (packetBuffer[CKH] << 8));
}

//Thing to run
void loop() {
getpacket();
}
