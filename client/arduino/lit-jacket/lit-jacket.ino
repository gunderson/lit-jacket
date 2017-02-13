// ------------------------------------------------------------
// DISPLAY VARS
// ------------------------------------------------------------

#include "FastLED.h"
#define DATA_PIN 13
#define NUM_LEDS 128

#define LED_TYPE    WS2812
#define COLOR_ORDER GRB
CRGB leds[NUM_LEDS];

#define BRIGHTNESS          96
#define FRAMES_PER_SECOND  60

int STRIP_STATE = 0;

int LED_PIN = 14;
int LED_STATE = HIGH;

// ------------------------------------------------------------
// COMMUNICATION VARS
// ------------------------------------------------------------

#define HWSERIAL Serial1
int BAUDRATE = 3000000;
int activeCommand = 0;

int commandDataLength[] = {0, 0, NUM_LEDS * 3};
int dataBuffer[1024]; // rgb values for each LED
int bufferIndex = 0;

boolean commandReady = false;  // whether the string is complete

// ------------------------------------------------------------
// COMMUNICATION FUNCTIONS
// ------------------------------------------------------------

void hwSerialEvent() {
	while (HWSERIAL.available()) {
		// get the new byte:
		int inByte = HWSERIAL.read();
		// Serial.println(inByte);

		// activeCommand == 0 means no active command
		if (activeCommand == 0){

			// reset buffer
			resetBuffer();

			//set new command
			activeCommand = inByte;

			// for commands that don't expect data, the command is ready
			if (commandDataLength[activeCommand] == 0){
				commandReady = true;
				break;
			}
			continue;
		}

		dataBuffer[bufferIndex++] = inByte;

		if (bufferIndex >= commandDataLength[activeCommand]){
			commandReady = true;
		}
	}
}

// ------------------------------------------------------------

void executeCommand(int command){
	// Serial.print("Command: ");
	// Serial.println(command);
	switch (command){
		case 1:
			toggleLedPin();
			break;
		case 2:
			writeLEDs(dataBuffer, commandDataLength[2]);
			break;
	}
	resetBuffer();
}

void resetBuffer(){
	activeCommand = 0;
	bufferIndex = 0;
	commandReady = false;
}

// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------

void setup() {

	// initialize display
	LEDS.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
	LEDS.setBrightness(BRIGHTNESS);

	// initialize comm
	HWSERIAL.begin(BAUDRATE, SERIAL_8N1);
	// Serial.begin(115200);
	// reset command buffer
	commandReady = false;
	activeCommand = 0;
	bufferIndex = 0;

	pinMode(LED_PIN, OUTPUT);
	digitalWrite(LED_PIN, LED_STATE);
}

// ------------------------------------------------------------

void loop() {
	hwSerialEvent();
	if (activeCommand > 0 && commandReady) {
		executeCommand(activeCommand);
	}
}

// ------------------------------------------------------------
// COMMANDS
// ------------------------------------------------------------

void toggleLedPin(){
	if (LED_STATE == LOW){
		LED_STATE = HIGH;
	} else {
		LED_STATE = LOW;
	}

	digitalWrite(LED_PIN, LED_STATE);
}

// ------------------------------------------------------------

void writeLEDs(int colorBytes[], int length){
	// set new state
	// STRIP_STATE = (STRIP_STATE + 1) % 4;

	// // fill array
	// switch (STRIP_STATE){
	// 	case 0:
	// 		for (int i = 0; i < length; i += 3){
	// 			leds[i] = CRGB( 0, 0, 0);
	// 		}
	// 		break;
	// 	case 1:
	// 		for (int i = 0; i < length; i += 3){
	// 			leds[i] = CRGB( 255, 0, 0);
	// 		}
	// 		break;
	// 	case 2:
	// 		for (int i = 0; i < length; i += 3){
	// 			leds[i] = CRGB( 0, 255, 0);
	// 		}
	// 		break;
	// 	case 3:
	// 		for (int i = 0; i < length; i += 3){
	// 			leds[i] = CRGB( 0, 0, 255);
	// 		}
	// 		break;
	// }

	for (int i = 0; i < NUM_LEDS; i++){
		leds[i] = CRGB( colorBytes[ i * 3 ], colorBytes[ i * 3 + 1 ], colorBytes[ i * 3 + 2 ]);
	}
	FastLED.show();
}
