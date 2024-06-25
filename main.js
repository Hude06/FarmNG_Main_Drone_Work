const startBut = document.getElementById("start");
const stopBut = document.getElementById("stop");
let GPSPoints = [];
let map;
let isFetching = false;
let markers = [];


startBut.addEventListener("click", function() {
  isFetching = true;
  fetch('https://apps.judemakes.com/amiga/tracking?tracking=true')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
    
   })
    .catch(error => {
      console.error('There was a problem getting GPS points:', error);
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
  .then(data => {
  
 })
  .catch(error => {
    console.error('There was a problem getting GPS points:', error);
  })
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
      console.log(GPSPoints)
      // Clear existing markers
      console.log(GPSPoints)
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];

      // Add new points to the map
      data.forEach(pointArray => {
        // Iterate through each point in the array
        console.log(pointArray)
        drawPoint(parseFloat(pointArray.latitude), parseFloat(pointArray.longitude), `Point at ${pointArray.latitude}, ${pointArray.longitude}`);
      })
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
