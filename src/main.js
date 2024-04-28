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