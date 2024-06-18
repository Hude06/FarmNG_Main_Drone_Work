def adjust_gps(latitude, longitude, accuracy):
    # Convert accuracy from degrees to meters
    if accuracy != 0:
        meters_accuracy = accuracy * 111139
        adjusted_lat = latitude + (accuracy / 111139)  # Adjust latitude
        adjusted_lon = longitude - (accuracy / (111139 * math.cos(math.radians(latitude))))  # Adjust longitude
        return {'latitude': adjusted_lat, 'longitude': adjusted_lon}
    else:
        return {'latitude': latitude, 'longitude': longitude}
