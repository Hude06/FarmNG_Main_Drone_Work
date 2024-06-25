const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');

// Create an Express application
const app = express();
let droneOnline = false;
let gpsData = [];
let tracking = false;

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
app.post('/batch', (req, res) => {
    const batch = req.body.data; // Assuming the body contains { data: [ {latitude, longitude, heading}, ... ] }
    
    console.log('Received batch of GPS points:', batch);
    if (tracking) {
        // Append batch to gpsData array
        gpsData.push(...batch);

        // Write GPS data to JSON file
        console.log("Wrote this batch of GPS points",gpsData)
        const jsonData = JSON.stringify(gpsData);
        fs.writeFile('gps_data.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing data to file:', err);
                res.status(500).json({ error: 'Failed to write GPS data to file' });
            } else {
                res.json({ message: 'Batch GPS data received and stored' });
            }
        });
    }
});

// Route to get current GPS data
app.get('/gps', (req, res) => {
    res.json(gpsData);
});

// Route to indicate drone is online
app.get('/tracking', (req, res) => {
    tracking = req.query.tracking === 'true'; // Convert the query parameter to a boolean
    console.log(tracking); // Logs true or false
    res.send("Setting tracking to" + tracking)
});
app.get('/IsTracking', (req, res) => {
    res.send(tracking);
})

// Start the server
const PORT = process.env.PORT || 4300;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
