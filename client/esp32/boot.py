"""Boot procedure"""

def do_connect():
	import network
	import os
	import time
	import json

	timeout_ms = 5 * 1000;

	# read network settings
	known_networks_fd = open('/flash/conf/wifi.json', 'r');
	known_networks = json.loads(known_networks_fd.read());

	# try each network setting in list
	wlan = network.WLAN(network.STA_IF)
	wlan.active(True)
	if not wlan.isconnected():
		networks = wlan.scan();
		for kn in known_networks:
			for n in networks:
				ssid = n[0];
				if kn['ssid'] in ssid:
					start_time_ms = time.ticks_ms();
					print('connecting to network: ' + kn['ssid'])
					wlan.connect(kn['ssid'], kn['psk'])
					while not wlan.isconnected():
						if time.ticks_ms() - start_time_ms > timeout_ms:
							print('connection timed out')
							break
						pass
	if wlan.isconnected():
		print('network connected: ', wlan.ifconfig())
	else:
		# if none can connect, open access point
		print('Unable to find a known network, starting access point: NSA-Stingray-Alpha')
		wlan.active(False)
		wlan.init(mode=network.AP_IF, ssid='NSA-Stingray-Alpha', auth=(network.AUTH_WPA_WPA2_PSK, '00000000'), channel=1)
		wlan.active(True)

do_connect()

