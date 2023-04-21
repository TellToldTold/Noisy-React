import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const width = 1798; // replace with your image width
const height = 1019; // replace with your image height

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(width, height);

function combineMaps(image1, image2) {
    const image12 = image1 + image2;
    console.log("Combining images: " + image1 + " and " + image2 + " ----> " + image12);
    loadImage('../public/noiseMaps/' + image1 + '.png').then((mapImg) => {

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(mapImg, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        loadImage('../public/noiseMaps/' + image2 + '.png').then((mapEdges) => {

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
                    imgData.data[i] = (re + rm) / 2;
                    imgData.data[i + 1] = (ge + gm) / 2;
                    imgData.data[i + 2] = (be + bm) / 2;
                    imgData.data[i + 3] = 255;
                }
            }

            ctx.putImageData(imgData, 0, 0);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync('../public/noiseMaps/' + image12 + '.png', buffer);
        });

    });
}


async function combineOnList() {
    //const mapNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const mapNames = ['a', 'ab', 'b', 'bc', 'c', 'cd', 'd', 'de', 'e', 'ef', 'f', 'fg', 'g', 'ga'];
    //const mapNames = ['1', '2', '3', '4'];
    const promises = mapNames.map((name, i) => combineMaps(name, mapNames[i < mapNames.length - 1 ? i + 1 : 0]));
    await Promise.all(promises);
}

combineOnList();