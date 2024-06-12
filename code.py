import time
import board
import adafruit_gps
import storage
import analogio
import digitalio
i2c = board.STEMMA_I2C()
gps = adafruit_gps.GPS_GtopI2C(i2c, debug=False)  # Use I2C interface
gps.send_command(b"PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
gps.send_command(b"PMTK220,1000")
last_print = time.monotonic()


while True:
    gps.update()
    current = time.monotonic()
    if current - last_print >= 1.0:
        last_print = current
        if not gps.has_fix:
            print("Waiting for fix...")
            continue
        print("=" * 40)  # Print a separator line.
        print("Latitude: {0:.6f} degrees".format(gps.latitude))
        print("Longitude: {0:.6f} degrees".format(gps.longitude))
        if gps.track_angle_deg is not None:
            print("Track angle: {} degrees".format(gps.track_angle_deg))