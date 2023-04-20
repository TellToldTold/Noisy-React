import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import perlin from './perlin.js';

// set image dimensions
const width = 1000; // replace with your image width
const height = 500; // replace with your image height

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(width, height);

function fbm(x, y){
    var scale = 100
    var octaves = 2
    var lacunarity = 2
    var gain = 0.5

    var total = 0;
    var amplitude = 1;
    var frequency = 1;

    for(var i = 0; i < octaves; i++){
        var v = perlin.get(x/scale*frequency,y/scale*frequency)*amplitude;
        total = total + v;
        frequency = frequency * lacunarity;
        amplitude = amplitude * gain;
    }

    return total;
}

function pattern(x, y){
    return fbm(x + 4.0 * fbm(x, y), y + 4.0 * fbm(x+5.2, y+1.3));
}

// Set the pixel data for the image
for (let x = 0; x < width; x++) {
    if(x % 100 == 0) {
        console.log("running... " + x);
    }
    for (let y = 0; y < height; y++) {
        const v = Math.floor((pattern(x, y, 60, 3) + 1) * 128);
        const i = (x + y * width) * 4;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
    }
}
// set the image data to the canvas context
ctx.putImageData(imgData, 0, 0);

// create a data URL for the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('map.png', buffer);