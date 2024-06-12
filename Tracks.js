// DOM elements
const startBut = document.getElementById("start");
const stopBut = document.getElementById("stop");
let newMap = document.getElementById("newMap");
const trackSelect = document.getElementById('maps');
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

const getCurrentTrack = () => {
  const selectedTrack = trackSelect.value;
  const trackList = Array.from(trackSelect.options).map(option => option.value);
  const trackIndex = trackList.indexOf(selectedTrack);

  return { selectedTrack, trackIndex };
};

trackSelect.addEventListener('change', getCurrentTrack);

class Track {
  constructor(name) {
    this.name = name;
    this.added = false;
    this.points = [];
  }
}

// Global variables
let droneConnected = false;
let GPSPoints = [];
let map;
let isFetching = false;
let currentMarkers = [];
let tracks = null

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
startBut.addEventListener("click", function(event) {
  event.preventDefault();
  isFetching = true;
  getGPSPoints();
});

newMap.addEventListener("click", function(event) {
  event.preventDefault();
  let mapName = prompt("Map Name?", "");
  if (mapName) {
    tracks.push(new Track(mapName));
    saveToLocalStorage("tracks",tracks)

  }
});

stopBut.addEventListener("click", function(event) {
  event.preventDefault();
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
  currentMarkers.push(marker);
}

// Fetch GPS points from server
function getGPSPoints() {
  if (!isFetching) return; // Stop fetching if tracking is stopped
  fetch('http://localhost:4300/gps')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (currentTrack !== null && currentTrack !== undefined) {
        tracks[currentTrack].points = data;
      }
      GPSPoints = data;
      droneConnected = true;

      // Clear existing markers
      currentMarkers.forEach(marker => map.removeLayer(marker));
      currentMarkers = [];

      // Add new points to the map
      tracks[currentTrack]?.points.forEach(point => {
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
  currentTrack = getCurrentTrack().trackIndex;
  document.getElementById("connection").innerHTML = "Connected to the drone " + droneConnected;
  for (let i = 0; i < tracks.length; i++) {
    if (!tracks[i].added) {
      createTrackOption(tracks[i].name); // Add options for each track
      tracks[i].added = true;
    }
  }
  requestAnimationFrame(loop);
}

// Initialization function
function init() {  
  if (getFromLocalStorage("tracks") === null) {
    tracks = []
  } else {
    tracks = getFromLocalStorage("tracks")
  }
  let currentTrack = null;
  getGPSPoints(); // Start fetching GPS points
  droneConnectedStatus(); // Check drone connection status
  initMap(); // Initialize Leaflet map
  loop(); // Continuously update connection status
}

// Call init function to start the application
init();
