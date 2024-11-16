// Description: This file contains the classes for the simulation

// Function to calculate Planck's law brightness
function planckBrightness(T, lambda) {
  // Convert lambda from nm to cm
 lambda *= 1e-7;      
 return (2 * PLANK_CONSTANT * Math.pow(LIGHT_SPEED, 2)) / 
        (Math.pow(lambda, 5) * (Math.exp(PLANK_CONSTANT * LIGHT_SPEED / (lambda * BOLTZMANN_CONSTANT * T)) - 1));
}

// Integrate Planck's brightness within a wavelength range
function integrateBrightness(T, minLambda, maxLambda) {
 const steps = 50;
 let totalBrightness = 0;
 const stepSize = (maxLambda - minLambda) / steps;
 for (let i = 0; i < steps; i++) {
     let lambda = minLambda + i * stepSize;
     totalBrightness += planckBrightness(T, lambda);
 }
 return totalBrightness / steps;
}

// Convert temperature to RGB based on integrated brightness in color ranges
function temperatureToRGB(T) {

 // Integrate brightness for each color range
 let redBrightness = integrateBrightness(T, RED_RANGE[0], RED_RANGE[1]);
 let greenBrightness = integrateBrightness(T, GREEN_RANGE[0], GREEN_RANGE[1]);
 let blueBrightness = integrateBrightness(T, BLUE_RANGE[0], BLUE_RANGE[1]);

 // Normalize colors
 let maxBrightness = Math.max(redBrightness, greenBrightness, blueBrightness);
 let r = redBrightness / maxBrightness;
 let g = greenBrightness / maxBrightness;
 let b = blueBrightness / maxBrightness;

 // Scale to RGB 0-255
 if (isNaN(r) && isNaN(g) && isNaN(b)){
   r = 0;
   g = 0;
   b = 0;
 }

 return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

// Function to draw a glowing circle
function drawGlowingCircle(x, y, diameter, glowColor) {
  let layers = 7;  // Increase layers for smoother glow
  let glowStrength = 3;  // Controls the spread of the glow

  // Create the outer glow layers
  for (let i = layers; i > 0; i--) {
    let alpha = map(i, 0, layers, 0, 255 / glowStrength);
    let diameter2 = 2 * (diameter/2 + i * glowStrength);  // Calculate diameter

    // Set color with decreasing alpha for outer glow effect
    fill(lerpColor(color(0, 0), glowColor, 1 - i / layers), alpha);
    circle(x, y, diameter2);
  }
}

function calculateLuneArea(R1, R2, d) {
  if (d >= R1 + R2) {
    return 0;  // No intersection
  }
  else if (d <= Math.abs(R1 - R2)) {
    return Math.PI * Math.min(R1, R2)**2;  // One circle is entirely within the other
  }
  else{
    // Calculate part of the lune area using circle segment formulas
    let part1 = R1**2 * Math.acos((d**2 + R1**2 - R2**2) / (2 * d * R1));
    let part2 = R2**2 * Math.acos((d**2 + R2**2 - R1**2) / (2 * d * R2));
    let part3 = 0.5 * Math.sqrt((-d + R1 + R2) * (d + R1 - R2) * (d - R1 + R2) * (d + R1 + R2));

    return part1 + part2 - part3;
  }
}



class Instantiate {
  constructor(x, y, color) {
      createCanvas(x, y);
      background(color);
  }
}


class Simulation {
  constructor() {
    background(0);
    t = 0;
  }

  updateParameter() {
    background(0);
    t = 0;

    //flush the trail arrays
    trailX1 = [];
    trailY1 = [];
    trailX2 = [];
    trailY2 = [];

    //flush the graph arrays
    graphV1 = [];
    graphV2 = [];
    graphT = [];

    //flush the graph arrays
    graphI = [];

    parameters[this.paramName] = parseFloat(this.input.value());
    this.computeParameters(parameters);
    //console.log(parameters);
  }

  computeParameters(parameters) {
    e = parameters.eccentricity;
    i = parameters.inclination * Math.PI / 180; // convert the degrees to radians
    P = parameters.period * 86400; // Convert period from days to seconds
    mp = parameters.massPrimary * 1.98e30; // Convert mass of primary star to kg
    ms = parameters.massSecondary * 1.98e30; // Convert mass of secondary star to kg
    omega = parameters.omega * Math.PI / 180; // convert the degrees to radians
    gamma = parameters.gamma;
    T1 = parameters.tempPrimary;
    T2 = parameters.tempSecondary;
    //radius in kilometers
    r1 = parameters.radiusPrimary * 6.96e5;
    r2 = parameters.radiusSecondary * 6.96e5;
    
    sizeration = (r1/r2);

    dt = ((parameters.period)/10)*86400/60; // 1 second in reality is period/7 days in simulation;
    
    console.log("CHECK DT", dt);
  
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

    //print values of these variables in the log for debugging
    //console.log(e, i, P, mp, ms, omega, gamma, a1, a2, b, K1, K2);
  }

  calculations() {
    // Mean Anomaly
    M = (2 * Math.PI * t) / P;

    // Eccentric anomaly (Lagrange's approximate solution)
    E = M + Math.sin(M) * (e - 0.125 * e * e * e) + Math.sin(2 * M) * (0.5 * e * e - 0.1667 * e * e * e * e);

    // True Anomaly
    nu = E + 2 * Math.atan((b * Math.sin(E)) / (1 - b * Math.cos(E)));

    // True coordinates of the stars (barycenter frame) as observed
    x1 = (a1 * (1 - e * e) * Math.cos(nu + omega)) / (1 + e * Math.cos(nu));

    y1 = ((a1 * (1 - e * e) * Math.sin(nu + omega)) / (1 + e * Math.cos(nu))) * Math.cos(i);


    
    x2 = (-a2 * (1 - e * e) * Math.cos(nu + omega)) / (1 + e * Math.cos(nu));
    
    y2 = ((-a2 * (1 - e * e) * Math.sin(nu + omega)) / (1 + e * Math.cos(nu))) * Math.cos(i);
  
    cosNuOmega = ((Math.cos(E) - e) * Math.cos(omega) - Math.sin(E) * Math.sin(omega) * Math.sqrt(1 - e * e)) / (1 - e * Math.cos(E));


    // radial velocity
    vrad1 = K1 * (cosNuOmega + e * Math.cos(omega)) + gamma;
    vrad2 = -K2 * (cosNuOmega + e * Math.cos(omega)) + gamma;


    // Radial acceleration
    aradbuffer = (Math.sin(nu + omega) * Math.sin(E) * (1 + e*(Math.cos(nu))) * 2 * Math.PI) / ((P * Math.sin(nu)) * (1 - e*(Math.cos(E)))**2);
    arad1 = -K1 * aradbuffer;
    arad2 = K2 * aradbuffer;


    delta_x = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);

    // Occultation condition
    //console.log("delta_x: ", delta_x, "r1: ", r1, "r2: ", r2);
    if (delta_x > r1 + r2) {
      // No occultation
      d1 = 0, d2 = 0;
      I = P1 * (Math.PI * r1**2) + P2 * (Math.PI * r2**2);
    }
    else{

      if (arad1 > 0) {
        // Star 1 is in front
        d1 = 0;
        d2 = calculateLuneArea(r1, r2, delta_x);
      }
      else{
        // Star 2 is in front
        d1 = calculateLuneArea(r1, r2, delta_x);
        d2 = 0;
      }
      console.log("d1: ", d1, "d2: ", d2);
      // Calculate the total intensity with reduced visible areas
      I = P1 * (Math.PI * r1**2 - d1) + P2 * (Math.PI * r2**2 - d2);
    }


    // Coordinate transformation to p5.js
    x1 = 125 * (x1 / a1) + 1100;
    y1 = -125 * (y1 / a1) + 200;
    x2 = 125 * (x2 / a1) + 1100;
    y2 = -125 * (y2 / a1) + 200;


    // Store current positions in the trail arrays
    trailX1.push(x1);
    trailY1.push(y1);
    trailX2.push(x2);
    trailY2.push(y2);
    graphV1.push(vrad1 * 2);
    graphV2.push(vrad2 * 2);
    graphI.push(I);
    graphT.push(t);


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

    // if (graphI.length > graphLength) {
    //   graphI.shift();
    // }


  }

  render() {
    background(0);
    //create a line
    stroke(255, 128);
    strokeWeight(2);

    //radial velocity graph
    //draw the axes
    line(500, 544.252578873 , 1400, 544.252578873);
    line(498.5, 450, 498.5, 800);
    
    //draw the labels
    textSize(14);
    fill(255);
    strokeWeight(0.25);
    text("Time (days)", 1300, 620);
    text("Radial Velocity (km/s)", 500, 425);

    text("Projected orbit with orange (primary star)\n", 400, 40);
    text("cyan (secondary star)\n", 400, 60);
    text("white (barycenter)\n", 400, 80);
    text("Semi-major axes: Orange: "+(a1*0.66e-8).toFixed(5)+" AU and Cyan: "+(a2*0.66e-8).toFixed(5)+" AU", 400, 100);
    // Time and Time increment
    //text("Time: " + t, 20, 380);
    text("Time Scale - 1 sec = " + ((parameters.period)/7).toFixed(5) + " days", 400, 120);


    if (t >= P) {
      t = 0;
    }
    // Time for debugging
    //console.log("Time: ", t);
    t += dt;

    this.calculations();
    //console.log(x1, y1, x2, y2, vrad1, vrad2);
    
    for (let i = 0; i < trailX1.length; i++) {
      noStroke();
      fill(255, 255 , 255, i);
      circle(trailX1[i], trailY1[i], 2);
    }
    
    for (let i = 0; i < trailX2.length; i++) {
      noStroke()
      fill(255, 255 , 255, i);
      circle(trailX2[i], trailY2[i], 2);
    }

    //add glow to the stars
    
    if (arad1 > 0) {
      noStroke();
      fill(255, 165, 0);
      drawGlowingCircle(x1, y1, 20, color(temperatureToRGB(T1)));

      noStroke();
      fill(0, 255, 255);
      drawGlowingCircle(x2, y2, 20 * sizeration, color(temperatureToRGB(T2)));
    }
    else{
      noStroke();
      fill(0, 255, 255);
      drawGlowingCircle(x2, y2, 20 * sizeration, color(temperatureToRGB(T2)));
      
      noStroke();
      fill(255, 165, 0);
      drawGlowingCircle(x1, y1, 20, color(temperatureToRGB(T1)));
    }
    //circle(x1, y1, 20);

    
    //circle(x2, y2, 20);
    
    noStroke();
    fill(255, 255, 255);
    circle(1100, 200, 5);

    if (t < P) {
      for (let i = 0; i < graphV1.length; i++) {
        noStroke()
        fill(255, 165 , 0,100);
        circle(graphT[i]/dt + 500,  -graphV1[i] + 600, 3);
        fill(0, 255 , 255, 100);
        circle(graphT[i]/dt + 500,  -graphV2[i] + 600, 3);
      }

      //initial value of intensity
      var initialI = graphI[0];
      var scale = initialI/750;

      for (let i = 0; i < graphI.length; i++) {
        noStroke()
        fill(255, 255 , 255, 255);
        console.log(-graphI[i]/scale + 1500);
        circle(graphT[i]/dt + 500, (-graphI[i]/scale) + 1225, 3);
      }
    }

    else{
      //flush the graph arrays
      graphV1 = [];
      graphV2 = [];
      graphT = [];
      graphI = [];
    }
  }

}

class InputField extends Simulation {
  constructor(labelText, defaultValue, x, y, paramName) {
    super();
    this.labelText = labelText;
    this.paramName = paramName;
  
    // Create the input element
    this.input = createInput(defaultValue);
    this.input.position(x, y);
    this.input.size(100);
  
    // Create the label element
    this.label = createElement("label", labelText);
    this.label.position(x + 130, y);
    this.label.style("color", "white");
  
    // Assign default values to the parameters object
    parameters[this.paramName] = parseFloat(defaultValue);

    // Compute the parameters
    this.computeParameters(parameters);
  
    // Add an event listener to the input element
    this.input.input(() => this.updateParameter());
  }
}

  

  

  