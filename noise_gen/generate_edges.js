import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const width = 1798; // replace with your image width
const height = 1019; // replace with your image height
const dimMin = Math.min(width, height);
const maxVal = 255;
const edge = dimMin / 12;
const widthBand = width / 7;
const heightBand = height / 5;
const rad = Math.floor(dimMin / 6);
const cent = rad + edge;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(width, height);


function drawEdges(map) {
    loadImage('./rawMaps/' + map).then((mapImg) => {

        ctx.drawImage(mapImg, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);


        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = (x + y * width) * 4;
                var r = Math.floor(imageData.data[i]);
                var g = Math.floor(imageData.data[i + 1]);
                var b = Math.floor(imageData.data[i + 2]);

                if (x < edge && y > cent && y < height - cent) {
                    r = Math.floor(r + ((255 - r) / edge) * (edge - x));
                    b = Math.floor(b + ((255 - b) / edge) * (edge - x));
                } else if (x > width - edge && y > cent && y < height - cent) {
                    r = Math.floor((r / edge) * (width - x));
                    b = Math.floor(b + ((255 - b) / edge) * (edge - (width - x)));
                } else if (x > edge && x < widthBand) {
                    r = Math.floor(Math.min(r + 25, maxVal));
                } else if (x < width - edge && x > width - widthBand) {
                    r = Math.floor(Math.max(r - 25, 0));
                }
                if (y < edge && x > cent && x < width - cent) {
                    g = Math.floor(g + ((255 - g) / edge) * (edge - y));
                    b = Math.floor(b + ((255 - b) / edge) * (edge - y));
                } else if (y > height - edge && x > cent && x < width - cent) {
                    g = Math.floor((g / edge) * (height - y));
                    b = Math.floor(b + ((255 - b) / edge) * (edge - (height - y)));
                } else if (y > edge && y < heightBand) {
                    g = Math.floor(Math.min(g + 25, maxVal));
                } else if (y < height - edge && y > height - heightBand) {
                    g = Math.floor(Math.max(g - 25, 0));
                }

                const topLeft = Math.sqrt(Math.pow(x - cent, 2) + Math.pow(y -cent, 2));
                const topRight = Math.sqrt(Math.pow(x - (width - cent), 2) + Math.pow(y -cent, 2));
                const bottomLeft = Math.sqrt(Math.pow(x - cent, 2) + Math.pow(y -(height - cent), 2));
                const bottomRight = Math.sqrt(Math.pow(x - (width - cent), 2) + Math.pow(y -(height - cent), 2));
                if (x < cent && y < cent && (topLeft > rad)) {
                    const cordX = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - y, 2));
                    const cordY = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - x, 2));

                    if ( y < edge && x < edge) {
                        b=255;
                    } else if (y > edge && x > edge) {
                        if (cordX > cordY) {
                            b = Math.floor(b + ((255 - b) / cordX)  * (cordX - x));
                        } else {
                            b = Math.floor(b + ((255 - b) / cordY)  * (cordY - y));
                        }
                    } else if (y < edge) {
                        b = Math.floor(b + ((255 - b) / cordY)  * (cordY - y));
                    } else {
                        b = Math.floor(b + ((255 - b) / cordX)  * (cordX - x));
                    }

                    if (y < edge) {
                        r = Math.floor(r + ((255 - r) / cent) * (cent - x));
                    } else {
                        r = Math.floor(r + ((255 - r) / cordX)  * (cordX - x));
                    }
                    if (x < edge) {
                        g = Math.floor(g + ((255 - g) / cent) * (cent - y));
                    } else {
                        g = Math.floor(g + ((255 - g) / cordY)  * (cordY - y));
                    }
                }
                if (x > width - cent && y < cent && (topRight > rad)) {
                    const cordX = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - y, 2));
                    const cordY = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - (width - x), 2));

                    if ( y < edge && x > width - edge) {
                        b=255;
                    } else if (y > edge && x < width - edge) {
                        if (cordX > cordY) {
                            b = Math.floor(b + ((255 - b) / cordX)  * (cordX - (width - x)));
                        } else {
                            b = Math.floor(b + ((255 - b) / cordY)  * (cordY - y));
                        }
                    } else if (y < edge) {
                        b = Math.floor(b + ((255 - b) / cordY)  * (cordY - y));
                    }   else {
                        b = Math.floor(b + ((255 - b) / cordX)  * (cordX - (width - x)));
                    }

                    if (y < edge) {
                        r = Math.floor( (r / cent) * (width - x));
                    } else {
                        r = Math.floor((r / cordX)  * (width - x));

                    }
                    if (x > width - edge) {
                        g = Math.floor(g + ((255 - g) / cent) * (cent - y));
                    } else {
                        g = Math.floor(g + ((255 - g) / cordY)  * (cordY - y));
                    }
                }
                if (x < cent && y > height - cent && (bottomLeft > rad)) {
                    const cordX = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - (height - y), 2));
                    const cordY = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - x, 2));
                    const slope = (cent - x) / (cent - (height - y));

                    if ( y > height - edge && x < edge) {
                        b=255;
                    } else if (y < height - edge && x > edge) {
                        if (cordX > cordY) {
                            b = Math.floor(b + ((255 - b) / cordX)  * (cordX - x));
                        } else {
                            b = Math.floor(b + ((255 - b) / cordY)  * (cordY - (height - y)));
                        }
                    }   else if (y > height - edge) {
                        b = Math.floor(b + ((255 - b) / cordY)  * (cordY - (height - y)));
                    } else {
                        b = Math.floor(b + ((255 - b) / cordX)  * (cordX - x));
                    }

                    if (y > height - edge) {
                        r = Math.floor(r + ((255 - r) / cent) * (cent - x));

                    } else {
                        r = Math.floor(r + ((255 - r) / cordX)  * (cordX - x));
                    }
                    if (x < edge) {
                        g = Math.floor((g / cent) * (height - y));
                    }   else {
                        g = Math.floor((g / cordY)  * (height - y));
                    }

                }
                if (x > width - cent && y > height - cent && (bottomRight > rad)) {
                    const cordX = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - (height - y), 2));
                    const cordY = cent - Math.sqrt(Math.pow(rad, 2) - Math.pow(cent - (width - x), 2));
                    const slope = (cent - (width - x)) / (cent - (height - y));

                    if ( y > height - edge && x > width - edge) {
                        b=255;
                    } else if (y < height - edge && x < width - edge) {
                        if (cordX > cordY) {
                            b = Math.floor(b + ((255 - b) / cordX)  * (cordX - (width - x)));
                        } else {
                            b = Math.floor(b + ((255 - b) / cordY)  * (cordY - (height - y)));
                        }
                    }   else if (y > height - edge) {
                        b = Math.floor(b + ((255 - b) / cordY)  * (cordY - (height - y)));
                    } else {
                        b = Math.floor(b + ((255 - b) / cordX)  * (cordX - (width - x)));
                    }

                    if (y > height - edge) {
                        r = Math.floor((r / cent) * (width - x));
                    } else {
                        r = Math.floor((r / cordX)  * (width - x));
                    }
                    if (x > width - edge) {
                        g = Math.floor((g / cent) * (height - y));
                    }   else {
                        g = Math.floor((g / cordY)  * (height - y));
                    }

                }

                imgData.data[i] = r;
                imgData.data[i + 1] = g;
                imgData.data[i + 2] = b;
                imgData.data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('../public/noiseMaps/' + map, buffer);

    });
}

async function drawOnList() {
    const mapNames = ['a.png', 'c.png', 'b.png', 'd.png', 'e.png', 'f.png', 'g.png'];
    //const mapNames = ['1.png', '2.png', '3.png', '4.png'];
    const promises = mapNames.map(name => drawEdges(name));
    await Promise.all(promises);
}

drawOnList();
