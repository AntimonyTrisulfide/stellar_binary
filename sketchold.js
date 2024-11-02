// classes
// abs constant
// utility func - math func
// 



const G = 6.673e-11;

let trailX1 = []; // Array to store x1 positions
let trailY1 = []; // Array to store y1 positions
let trailX2 = []; // Array to store x1 positions
let trailY2 = []; // Array to store y1 positions
let graphV1 = []; // Array to store V1 velocities
let graphV2 = []; // Array to store V2 velocities
let graphT  = []; // Array to store T times

function windowResized() {
  resizeCanvas(windowWidth, 2*windowHeight);  // Adjust the canvas size when window is resized
}

function setup() {
  createCanvas(windowWidth, 2*windowHeight);
  
  trailLength = 200;
  graphLength = 200;
  
  // Create input boxes for each parameter
  inputE = createInput("0.000397"); // Eccentricity
  inputE.position(20, 20);
  inputE.size(100);
  createElement("label", "Eccentricity of the true ellipse")
    .position(150, 20)
    .style("color", "white");

  inputI = createInput("137.15600000806"); // Inclination
  inputI.position(20, 60);
  inputI.size(100);
  createElement("label", "Inclination in degrees")
    .position(150, 60)
    .style("color", "white");

  inputP = createInput("104.021572"); // Period
  inputP.position(20, 100);
  inputP.size(100);
  createElement("label", "Period of the orbit in days")
    .position(150, 100)
    .style("color", "white");

  inputMp = createInput("2.5579"); // Mass of Primary Star
  inputMp.position(20, 140);
  inputMp.size(100);
  createElement("label", "Mass of primary star in solar masses")
    .position(150, 140)
    .style("color", "white");

  inputMs = createInput("2.4727"); // Mass of Secondary Star
  inputMs.position(20, 180);
  inputMs.size(100);
  createElement("label", "Mass of secondary star in solar masses")
    .position(150, 180)
    .style("color", "white");

  inputOmega = createInput("316.9997864"); // Argument of Periastron
  inputOmega.position(20, 220);
  inputOmega.size(100);
  createElement("label", "Argument of periastron in degrees")
    .position(150, 220)
    .style("color", "white");

  inputGamma = createInput("29.4232"); // Velocity of Orbit Barycenter
  inputGamma.position(20, 260);
  inputGamma.size(100);
  createElement("label", "Radial velocity of barycenter in km/s")
    .position(150, 260)
    .style("color", "white");

  // Initialize variables
  updateVariables();

  t = 0;
  dt = 14*86400/60; // 1 second in reality is 1 week in simulation

  // Set input event listeners to update variables whenever inputs change
  inputE.input(updateVariables);
  inputI.input(updateVariables);
  inputP.input(updateVariables);
  inputMp.input(updateVariables);
  inputMs.input(updateVariables);
  inputOmega.input(updateVariables);
  inputGamma.input(updateVariables);
  
}

function updateVariables() {
  e = float(inputE.value());
  i = float(inputI.value()) * Math.PI / 180; // convert the degrees to radians
  P = float(inputP.value()) * 86400; // Convert period from days to seconds
  mp = float(inputMp.value()) * 1.98e30; // Convert mass of primary star to kg
  ms = float(inputMs.value()) * 1.98e30; // Convert mass of secondary star to kg
  omega = float(inputOmega.value()) * Math.PI / 180; // convert the degrees to radians
  gamma = float(inputGamma.value());

  // Semi-major axis for primary and secondary stars in km
  a1 =
    1e-3 *
    (ms / (1 + e)) *
    Math.cbrt((G * P * P) / (4 * Math.PI * Math.PI)) *
    Math.pow(ms + mp, -2 / 3);
  a2 =
    1e-3 *
    (mp / (1 + e)) *
    Math.cbrt((G * P * P) / (4 * Math.PI * Math.PI)) *
    Math.pow(ms + mp, -2 / 3);

  // Compute constant b for true anomaly equation
  b = e / (1 + Math.sqrt(1 - e * e));
  
  K1 = Math.sin(i) * 2 * Math.PI * a1 / (P * Math.sqrt(1 - e * e));
  K2 = Math.sin(i) * 2 * Math.PI * a2 / (P * Math.sqrt(1 - e * e));
  
}

function draw() {
  background(0);

  textSize(14);
  fill(255);
  text("Projected orbit with red (primary star), blue (secondary star), white (barycenter)", 20, 300);
  text("Semi-major axes: Red: "+(a1*0.66e-8).toFixed(2)+" AU and Blue: "+(a2*0.66e-8).toFixed(2)+" AU", 20, 320);
  
  if (t >= P) {
    t = 0;
  }
  
  // Time increment
  t += dt;
  // Mean Anomaly
  M = (2 * Math.PI * t) / P;
  
  // Eccentric anomaly (Lagrange's approximate solution)
  E =
    M +
    Math.sin(M) * (e - 0.125 * e * e * e) +
    Math.sin(2 * M) * (0.5 * e * e - 0.1667 * e * e * e * e);

  // True Anomaly
  nu = E + 2 * Math.atan((b * Math.sin(E)) / (1 - b * Math.cos(E)));
  // True coordinates of the stars (barycenter frame) as observed
  x1 = (a1 * (1 - e * e) * Math.cos(nu + omega)) / (1 + e * Math.cos(nu));
  y1 =
    ((a1 * (1 - e * e) * Math.sin(nu + omega)) / (1 + e * Math.cos(nu))) *
    Math.cos(i);
  x2 = (-a2 * (1 - e * e) * Math.cos(nu + omega)) / (1 + e * Math.cos(nu));
  y2 =
    ((-a2 * (1 - e * e) * Math.sin(nu + omega)) / (1 + e * Math.cos(nu))) *
    Math.cos(i);
  
  cosNuOmega = ((Math.cos(E) - e) * Math.cos(omega) - Math.sin(E) * Math.sin(omega) * Math.sqrt(1 - e * e)) / (1 - e * Math.cos(E));
  
  // radial velocity
  vrad1 = K1 * (cosNuOmega + e * Math.cos(omega)) + gamma;
  vrad2 = -K2 * (cosNuOmega + e * Math.cos(omega)) + gamma;

  // Coordinate transformation to p5.js
  x1 = 125 * (x1 / a1) + windowWidth/2;
  y1 = -125 * (y1 / a1) + 500;
  x2 = 125 * (x2 / a1) + windowWidth/2;
  y2 = -125 * (y2 / a1) + 500;

  // Store current positions in the trail arrays
  trailX1.push(x1);
  trailY1.push(y1);
  trailX2.push(x2);
  trailY2.push(y2);
  graphV1.push(vrad1);
  graphV2.push(vrad2);
  graphT.push(t);
  
  // Limit the trail length
  if (trailX1.length > trailLength) {
    trailX1.shift(); // Remove the oldest x1 position
    trailY1.shift();
    trailX2.shift();
    trailY2.shift();
  }
  
    // Limit the trail length
  if (trailX1.length > graphLength) {
    graphV1.shift();
    graphV2.shift();
    graphT.shift();
  }
  
  noStroke();
  fill(255, 0, 0);
  circle(x1, y1, 20);
  
  noStroke();
  fill(0, 0, 255);
  circle(x2, y2, 20);
  
  noStroke();
  fill(255, 255, 255);
  circle(windowWidth / 2, 500, 5);
  
  for (let i = 0; i < trailX1.length; i++) {
    noStroke();
    fill(255, 0 , 0, i);
    circle(trailX1[i], trailY1[i], 2);
  }
  
  for (let i = 0; i < trailX2.length; i++) {
    noStroke()
    fill(0, 0 , 255, i);
    circle(trailX2[i], trailY2[i], 2);
  }
  
  for (let i = 0; i < graphV1.length; i++) {
    noStroke()
    fill(255, 0 , 0,100);
    circle(graphT[i]/(14*86400/60) + 100,  -graphV1[i] + 700, 2);
    fill(0, 0 , 255, 100);
    circle(graphT[i]/(14*86400/60) + 100,  -graphV2[i] + 700, 2);
    fill(255);
    circle(graphT[i]/(14*86400/60) + 100,  670, 2);
  }
}