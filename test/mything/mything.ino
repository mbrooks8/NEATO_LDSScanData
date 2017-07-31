#include <TimerThree.h> // used for ultrasonic PWM motor control
#include <PID.h>
#include <EEPROM.h>
#include <EEPROMAnything.h>
#include <SerialCommand.h>

    int rxPin = 0;
    int txPin = 1;
char ldsData;
void setup() {
  // put your setup code here, to run once:
 Serial.begin(115200);              // ...set up the serial ouput in 0004 format
 pinMode(rxPin, INPUT);
 pinMode(txPin, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  ldsData = Serial.read();
Serial.print(ldsData, BIN);


}
