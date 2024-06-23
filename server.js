const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');

// Create an Express application
const app = express();
let droneOnline = false;
let gpsData = [];

function droneIsOnline() {
    setTimeout(() => {
        droneOnline = false;
        console.log(droneOnline);
        droneIsOnline(); // Call the function recursively after 6 seconds
    }, 6000); // 6000 milliseconds = 6 seconds
}

droneIsOnline(); // Call the function to start the interval

// Middleware for CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Route to receive batch GPS data
app.post('/gps/batch', (req, res) => {
    const batch = req.body.data; // Assuming the body contains { data: [ {latitude, longitude, heading}, ... ] }
    
    console.log('Received batch of GPS points:', batch);

    // Append batch to gpsData array
    gpsData.push(...batch);

    // Write GPS data to JSON file
    const jsonData = JSON.stringify(gpsData);
    fs.writeFile('gps_data.json', jsonData, (err) => {
        if (err) {
            console.error('Error writing data to file:', err);
            res.status(500).json({ error: 'Failed to write GPS data to file' });
        } else {
            res.json({ message: 'Batch GPS data received and stored' });
        }
    });
});

// Route to get current GPS data
app.get('/gps', (req, res) => {
    res.json(gpsData);
});

// Route to indicate drone is online
app.get('/ImOnline', (req, res) => {
    res.send("Sending that IM ONLINE");
    droneOnline = true;
    console.log(droneOnline);
});

// Route to check if drone is online
app.get('/DroneOnline', (req, res) => {
    res.send(droneOnline);
});

// Start the server
const PORT = process.env.PORT || 4300;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
