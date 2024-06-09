// DOM elements
const startBut = document.getElementById("start");
const stopBut = document.getElementById("stop");
class Track {
  constructor(name) {
    this.name = name;
  }
}

// Global variables
let droneConnected = false;
let GPSPoints = [];
let map;
let isFetching = false;
let markers = [];
let track1 = new Track("track1");
let tracks = [track1];

// Class to represent a track
// Function to create a new track option in the select element
function createTrackOption(trackName) {
  const selectElement = document.getElementById("maps");
  const newOption = document.createElement("option");
  newOption.value = trackName;
  newOption.text = trackName;
  selectElement.appendChild(newOption);
}

// Display connection status
document.getElementById("connection").innerHTML = "Connected to the drone " + droneConnected;

// Event listeners for start and stop buttons
startBut.addEventListener("click", function() {
  console.log("Start button clicked");
  isFetching = true;
  getGPSPoints();
});

stopBut.addEventListener("click", function() {
  console.log("Stop button clicked");
  isFetching = false;
});

// Initialize Leaflet map
function initMap() {
  map = L.map('map').setView([34, -118], 5); // Set initial map view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Set maximum zoom level
  map.options.maxZoom = 30;
}

// Draw a point on the map
function drawPoint(lat, lng, popupText) {
  const marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popupText);
  markers.push(marker);
}

// Fetch GPS points from server
function getGPSPoints() {
  if (!isFetching) return; // Stop fetching if tracking is stopped

  fetch('https://apps.hude.earth/gps')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      GPSPoints = data;
      console.log(GPSPoints);
      droneConnected = true;

      // Clear existing markers
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];

      // Add new points to the map
      GPSPoints.forEach(point => {
        drawPoint(parseFloat(point.longitude), parseFloat(point.latitude), `Point at ${point.latitude}, ${point.longitude}`);
      });
    })
    .catch(error => {
      console.error('There was a problem getting GPS points:', error);
      droneConnected = false;
    })
    .finally(() => {
      if (isFetching) {
        setTimeout(getGPSPoints, 2000); // Retry every 2 seconds if fetching is enabled
      }
    });
}

// Check drone connection status
function droneConnectedStatus() {
  droneConnected = false;
  setTimeout(droneConnectedStatus, 2500); // Retry every 2.5 seconds
}

// Update connection status continuously
function loop() {
  document.getElementById("connection").innerHTML = "Connected to the drone " + droneConnected;
  requestAnimationFrame(loop);
}

// Initialization function
function init() {  
  getGPSPoints(); // Start fetching GPS points
  droneConnectedStatus(); // Check drone connection status
  initMap(); // Initialize Leaflet map
  for (let i = 0; i < tracks.length; i++) {
    createTrackOption(tracks[i].name); // Add options for each track
  }
  loop(); // Continuously update connection status
}

// Call init function to start the application
init();
