const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');
// Create an Express application
const app = express();
let droneOnline = false;
// Define a route
let gpsData = [];
function droneIsOnline() {
    setTimeout(() => {
        droneOnline = false;
        console.log(droneOnline);
        droneIsOnline(); // Call the function recursively after 6 seconds
    }, 6000); // 6000 milliseconds = 6 seconds
}
droneIsOnline(); // Call the function to start the interval
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.get('/gps', (req, res) => {
    const { latitude, longitude } = req.query;

    console.log('Received GPS point:', { latitude, longitude });

    if (latitude || longitude){
        const point = { latitude, longitude };
        gpsData.push(point);
        const jsonData = JSON.stringify(gpsData);
        fs.writeFile('gps_data.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing data to file:', err);
            }
        });
        res.send(jsonData)
    }    

    if (!latitude || !longitude) {
        res.send(JSON.stringify(gpsData))
    }
    // Write JSON data to file
    // Here you can do something with the received GPS point
});

app.get('/ImOnline', (req, res) => {
    res.send("Sending that IM ONLINE")
    droneOnline = true
    console.log(droneOnline);
})
app.get('/DroneOnline', (req, res) => {
    res.send(droneOnline);
});

// Start the server
const PORT = process.env.PORT || 4300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
