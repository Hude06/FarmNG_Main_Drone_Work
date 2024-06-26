const startBut = document.getElementById("start");
const stopBut = document.getElementById("stop");
let GPSPoints = [];
let map; // Define map variable here
let isFetching = false;
let markers = [];
let pvt = document.getElementById("pvt");
let lastPoint = 0;
let tracking = document.getElementById("tracking");

startBut.addEventListener("click", function() {
  isFetching = true;
  fetch('https://apps.judemakes.com/amiga/tracking?tracking=true')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    })
  getGPSPoints();
});

stopBut.addEventListener("click", function() {
  fetch('https://apps.judemakes.com/amiga/tracking?tracking=false')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
  isFetching = false;
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
});

function initMap() {
  map = L.map('map').setView([34, -118], 5); // Initialize the map variable here

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Set maximum zoom level
  map.options.maxZoom = 30; // Adjust this value as needed
}

function drawPoint(lat, lng, popupText) {
  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(popupText);
  markers.push(marker);
}

function getGPSPoints() {
  if (!isFetching) return; // Stop fetching if tracking is stopped

  fetch('https://apps.judemakes.com/amiga/gps')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      GPSPoints = data;
      lastPoint = GPSPoints.length;
      // Clear existing markers
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];

      // Add new points to the map
      GPSPoints.forEach(pointArray => {
        // Iterate through each point in the array
        console.log(typeof(parseFloat(pointArray[1])));
        drawPoint(parseFloat(pointArray[0]), parseFloat(pointArray[1]), `Point at ${pointArray[0]}, ${pointArray[1]}`);
      });
    })
    .finally(() => {
      setTimeout(getGPSPoints, 2000); // Retry every 2 seconds if fetching is enabled
    });
}

function loop() {
  pvt.innerHTML = GPSPoints[lastPoint - 1];
  tracking.innerHTML = "We are fetching GPS? " + isFetching;
  requestAnimationFrame(loop);
}

function init() {
  initMap();
  getGPSPoints();
  loop();
}

init();
