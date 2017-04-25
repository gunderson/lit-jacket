// ------------------------------------------------------------
// DISPLAY VARS
// ------------------------------------------------------------

#include <FastLED.h>
#define LED_PIN 15
#define STATUS_PIN 13
#define NUM_LEDS 128

#define LED_TYPE WS2812
#define COLOR_ORDER GRB
CRGB leds[NUM_LEDS];

#define BRIGHTNESS 96
#define FRAMES_PER_SECOND 30

byte STRIP_STATE = 0;

byte LED_STATE = HIGH;

// ------------------------------------------------------------
// TXRX VARS
// ------------------------------------------------------------

#define HWSERIAL Serial1
unsigned int BAUDRATE = 921600;
byte activeCommand = 0;

byte commandDataLength[] = {0, 0, NUM_LEDS * 3};
byte dataBuffer[1024]; // rgb values for each LED
byte bufferIndex = 0;

boolean commandReady = false; // whether the string is complete

// ------------------------------------------------------------
// TXRX FUNCTIONS
// ------------------------------------------------------------

void hwSerialEvent()
{
    while (HWSERIAL.available())
    {
	// get the new byte:
	byte inByte = HWSERIAL.read();
	Serial.println(inByte);

	// activeCommand == 0 means no active command
	if (activeCommand == 0)
	{

	    // reset buffer
	    resetBuffer();

	    //set new command
	    activeCommand = inByte;

	    // for commands that don't expect data, the command is ready
	    if (commandDataLength[activeCommand] == 0)
	    {
		commandReady = true;
		break;
	    }
	    continue;
	}

	dataBuffer[bufferIndex++] = inByte;

	if (bufferIndex >= commandDataLength[activeCommand])
	{
	    commandReady = true;
	}
    }
}

// ------------------------------------------------------------

void executeCommand(byte command)
{
    Serial.print("Command: ");
    Serial.println(command);
    switch (command)
    {
    case 1:
	toggleLedPin();
	break;
    case 2:
	writeLEDs(dataBuffer, commandDataLength[2]);
	break;
    }
    resetBuffer();
}

void resetBuffer()
{
    activeCommand = 0;
    bufferIndex = 0;
    commandReady = false;
}

// ------------------------------------------------------------
// I2C VARS
// ------------------------------------------------------------

// int raw_values[9];
// //char str[512];
// float ypr[3]; // yaw pitch roll
// float val[9];

// // Set the FreeIMU object
// FreeIMU my3IMU = FreeIMU();

// ------------------------------------------------------------
// I2C FUNCTIONS
// ------------------------------------------------------------

// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------

void setup()
{
    // Wire.begin();
    // delay(5);

    // my3IMU.init(true); // the parameter enable or disable fast mode
    // delay(5);

    // initialize display
    LEDS.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
    LEDS.setBrightness(BRIGHTNESS);

    // initialize comm
    // HWSERIAL is for internal comm w/ embedded proc
    HWSERIAL.begin(BAUDRATE, SERIAL_8N1);
    // Serial is for external monitoring
    Serial.begin(115200);
    // reset command buffer
    commandReady = false;
    activeCommand = 0;
    bufferIndex = 0;

    pinMode(STATUS_PIN, OUTPUT);
    digitalWrite(STATUS_PIN, LED_STATE);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);
}

// ------------------------------------------------------------

void loop()
{
    hwSerialEvent();
    if (activeCommand > 0 && commandReady)
    {
	executeCommand(activeCommand);
    }
}

// ------------------------------------------------------------
// COMMANDS
// ------------------------------------------------------------

void toggleLedPin()
{
    if (LED_STATE == LOW)
    {
	LED_STATE = HIGH;
    }
    else
    {
	LED_STATE = LOW;
    }

    digitalWrite(STATUS_PIN, LED_STATE);
}

// ------------------------------------------------------------

void writeLEDs(byte colorBytes[], byte length)
{

    for (unsigned int i = 0; i < NUM_LEDS; i++)
    {
	leds[i] = CRGB(colorBytes[i * 3], colorBytes[i * 3 + 1], colorBytes[i * 3 + 2]);
    }
    FastLED.show();
}

// void readSensors()
// {
//     my3IMU.getValues(val);
//     my3IMU.getYawPitchRoll(ypr);
// }