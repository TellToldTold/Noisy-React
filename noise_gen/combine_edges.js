import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
// set image dimensions
const width = 1232; // replace with your image width
const height = 869; // replace with your image height

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(width, height);

const mapImg = new Image();
mapImg.src = './rawMaps/raw1.png';
mapImg.onload = () => {

    ctx.drawImage(mapImg, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const mapEdges = new Image();
    mapEdges.src = './edges.png';
    mapEdges.onload = () => {

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(mapImg, 0, 0, width, height);
        const edgesData = ctx.getImageData(0, 0, width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = (x + y * width) * 4;
                const rm = Math.floor(imageData.data[i]);
                const gm = Math.floor(imageData.data[i + 1]);
                const bm = Math.floor(imageData.data[i + 2]);

                const re = Math.floor(edgesData.data[i]);
                const ge = Math.floor(edgesData.data[i + 1]);
                const be = Math.floor(edgesData.data[i + 2]);
                imgData.data[i] = re === 0 || re === 255 ? re : rm;
                imgData.data[i + 1] = ge === 0 || ge === 255 ? ge : gm;
                imgData.data[i + 2] = be === 0 || be === 255 ? be : bm;
                imgData.data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('../public/noiseMaps/map.png', buffer);
    }

};
