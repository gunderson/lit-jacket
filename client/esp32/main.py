from machine import Pin

p13 = Pin(13, Pin.OUT)
p13.value(0)

def loop():
