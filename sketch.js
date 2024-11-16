const G = 6.673e-11; // Gravitational constant

// Define constants for Planck's law
const PLANK_CONSTANT = 6.626e-27;
const BOLTZMANN_CONSTANT = 1.38e-16;
const LIGHT_SPEED = 3e10;

// Set wavelength ranges for color bands in nm
const RED_RANGE = [600, 800];
const GREEN_RANGE = [480, 600];
const BLUE_RANGE = [350, 480];


function windowResized() {
  //get current width and height of the browser window and resize the canvas accordingly
  if(window.innerWidth < windowHeight){
    resizeCanvas(windowWidth, windowHeight);  // Adjust the canvas size when window is resized
    background(0);
    t = 0;
    trailX1 = [];
    trailY1 = [];
    trailX2 = [];
    trailY2 = [];
    graphV1 = [];
    graphV2 = [];
    graphT = [];
  }
}


// Declaration of Variables - (Reason - ES6 doesnt support declaration of variables in class)
let trailX1 = []; // Array to store x1 positions
let trailY1 = []; // Array to store y1 positions
let trailX2 = []; // Array to store x1 positions
let trailY2 = []; // Array to store y1 positions
let graphV1 = []; // Array to store V1 velocities
let graphV2 = []; // Array to store V2 velocities
let graphT  = []; // Array to store T times
let graphI = []; // Array to store I intensities


let inputFields = []; // Array to store the input fields


let parameters = {}; // Object to store the parameters (Handy for Providing Inputs to the Simulation Class and wherever needed)


var t;// Time and time increment
var trailLength = 200, graphLength = 200; // Length of the trails
var e, i, P, mp, ms, omega, gamma; // Orbital parameters (time independent)
var T1, T2, r1, r2;

var dt; // Time increment
var a1, a2, b, K1, K2; // Derived parameters (time independent)
var M, E, nu, x1, y1, x2, y2, cosNuOmega, vrad1, vrad2; // Derived parameters (time dependent)

var sizeration;
var arad1, arad2, aradbuffer; // Radial acceleration
var delta_x; // Distance between the stars

var d1 = 0, d2 = 0, I; // Area reduction and total intensity
var P1 = 1, P2 = 1; // Intensity of the stars per unit area


function setup() {
  // Create a canvas that is the size of the window using MainWindow Object
  mainwindow = new Instantiate(windowWidth, windowHeight, 0);

  inputFields.push(new InputField("Eccentricity", "0.000397", 20, 20, "eccentricity"));
  inputFields.push(new InputField("Inclination (degrees)", "90", 20, 60, "inclination"));
  inputFields.push(new InputField("Period (days)", "2", 20, 100, "period"));
  inputFields.push(new InputField("Mass of Primary (solar masses)", "0.5", 20, 140, "massPrimary"));
  inputFields.push(new InputField("Mass of Secondary (solar masses)", "0.2", 20, 180, "massSecondary"));
  inputFields.push(new InputField("Argument of Periastron (degrees)", "316.9997864", 20, 220, "omega"));
  inputFields.push(new InputField("Radial Velocity (km/s)", "29.4232", 20, 260, "gamma"));
  inputFields.push(new InputField("Radius of Primary Star (solar radius)", "4", 400, 20, "radiusPrimary"));
  inputFields.push(new InputField("Radius of Secondary Star (solar radius)", "1", 400, 60, "radiusSecondary"));
  inputFields.push(new InputField("Temperature of Primary Star (kelvin)", "5000", 400, 100, "tempPrimary"));
  inputFields.push(new InputField("Temperature of Secondary Star (kelvin)", "5000", 400, 140, "tempSecondary"));


  simulation = new Simulation();

}

function draw() {
  simulation.render();
}