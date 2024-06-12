const startBut = document.getElementById("start");
const stopBut = document.getElementById("stop");
let GPSPoints = [];
let map;
let isFetching = false;
let markers = [];


startBut.addEventListener("click", function() {
  console.log("Start button clicked");
  isFetching = true;
  getGPSPoints();
});

stopBut.addEventListener("click", function() {
  console.log("Stop button clicked");
  isFetching = false;
});

function initMap() {
  map = L.map('map').setView([34, -118], 5); // Change the initial zoom level here

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
      console.log(GPSPoints);
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
    })
    .finally(() => {
      if (isFetching) {
        setTimeout(getGPSPoints, 2000); // Retry every 2 seconds if fetching is enabled
      }
    });
}

function loop() {
  requestAnimationFrame(loop);
}

function init() {  
  getGPSPoints()
  initMap();
  loop();
}

init();
