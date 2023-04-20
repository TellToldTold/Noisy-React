import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
// set image dimensions
const width = 1232; // replace with your image width
const height = 869; // replace with your image height

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(width, height);

loadImage('./rawMaps/raw1.png').then((mapImg) => {

    ctx.drawImage(mapImg, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    loadImage('./edges.png').then((mapEdges) => {

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(mapEdges, 0, 0, width, height);
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
                imgData.data[i] = re < 10 || re > 245 ? re : rm;
                imgData.data[i + 1] = ge < 10 || ge > 245 ? ge : gm;
                imgData.data[i + 2] = be < 10 || be > 245 ? be : bm;
                imgData.data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('../public/noiseMaps/map1.png', buffer);
    });

});
