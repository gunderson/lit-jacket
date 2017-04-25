byte midi_buffer[2048];
int buffer_size = 0;

byte channel = 0;

long midi_time = 0;
byte midi_hours = 0;
byte midi_minutes = 0;
byte midi_seconds = 0;
byte midi_frames = 0;
byte midi_framerate = 30;

void midiLoop(byte buffer[], int buffer_size)
{
    parseMessage(buffer, buffer_size);
}

void parseMessage(byte buffer[], int buffer_size)
{
    byte message_type = packet[0] >> 4;
    int packet_size = 0;
    if (message_type < 0xf)
    {
	// Channel Voice Message
	packet_size = executeChannelVoiceMessage(buffer);
    }
    else
    {
	// System Common Message
	packet_size = executeSystemCommonMessage(buffer);
    }
    // shift buffer by packet_size
    shiftArray(buffer, packet_size);
}

void shiftArray(byte buffer[], int amount)
{
    for (int i = 0; i < amount; i++)
    {
	buffer[i] = buffer[i + amount];
    }
    buffer_length -= amount;
}

int executeChannelVoiceMessage(byte buffer[])
{
    byte packet_size = 3;
    byte packet[] byte command = packet[0] >> 4;
    byte channel = packet[0] & 0xf;
    return packet_size;
}

int executeSystemCommonMessage(byte packet[])
{
    byte command = packet[0] & 0xf;
    int packet_size = 0;
    switch (command)
    {
    case 0:
	// System Exclusive
	// find packet size
	while (buffer[packet_size] != 0xf7)
	{
	    if (++packet_size > buffer_size)
	    {
		// incomplete packet
		return 0;
	    }
	}
	break;
    case 1:
	// MIDI Time Code Quarter Frame

	break;
    case 2:
	// Song Position Pointer
	break;
    case 3:
	// Song Select
	break;
    case 6:
	// Tune Request
	break;
    case 7:
	// Escape
	byte data_size = buffer[1];
	packet_size = 2 + data_size;

	byte data[data_size];
	while (--data_size >= 0)
	{
	    data[data_size] = buffer[2 + data_size];
	}
	handleDataPacket(data);
	break;
    case 8:
	// Tick
	break;
    }
    return packet_size;
}

void handleDataPacket(byte data[])
{
}