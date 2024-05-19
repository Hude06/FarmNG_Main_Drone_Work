let startBut = document.getElementById("start")
let stopBut = document.getElementById("stop")
let droneConnected = false;

document.getElementById("connection").innerHTML = "Connected to the drone " + droneConnected
startBut.addEventListener("click", function() {
  console.log("We had a click, Start");

});
stopBut.addEventListener("click", function() {
  console.log("We had a click, Stop");
});
function checkDroneStatus() {
  fetch('http://apps.hude.earth:4300/DroneOnline')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      console.log('Drone status:', data);
      droneConnected = data
      document.getElementById("connection").innerHTML = "Connected to the drone " + droneConnected

  })
  .catch(error => {
      console.error('There was a problem checking drone status:', error);
  });
  setTimeout(() => {
    checkDroneStatus()
  }, 1000); // 6000 milliseconds = 6 seconds
}

checkDroneStatus();