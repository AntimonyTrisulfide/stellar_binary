// Define constants for Planck's law
const PLANK_CONSTANT = 6.626e-27;
const BOLTZMANN_CONSTANT = 1.38e-16;
const LIGHT_SPEED = 3e10;

// Set wavelength ranges for color bands in nm
const RED_RANGE = [600, 800];
const GREEN_RANGE = [480, 600];
const BLUE_RANGE = [350, 480];

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

// p5.js setup function
function setup() {
    createCanvas(400, 400);
    noLoop();

    let tempKelvin = 30; // Example temperature (similar to the Sun)
    let rgbColor = temperatureToRGB(tempKelvin);
    console.log(`RGB color for a star with surface temperature ${tempKelvin} K is ${rgbColor}`);
    background(rgbColor[0], rgbColor[1], rgbColor[2]);
}
