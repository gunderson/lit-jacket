"""Boot procedure"""

def do_connect():
	"""Connect to wifi"""
	import network
	import os

	# read network settings
	# try each network setting in list

	sta_if = network.WLAN(network.STA_IF)
	if not sta_if.isconnected():
		print('connecting to network...')
		sta_if.active(True)
		sta_if.connect('<essid>', '<password>')
		while not sta_if.isconnected():
			pass
	print('network config:', sta_if.ifconfig())

	# if none can connect, open access point
	# serve wifi form
