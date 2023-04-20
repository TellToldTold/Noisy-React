import styles from '@/styles/Home.module.css'
import {useEffect, useRef} from "react";

const accelerationAngle = Math.PI / 2;

const pixelSize = 2;
const pixelCount = 10000;
const pixelAcc = 0.3;
const vMax = 3;

export default function Home() {
    const canvasImg = useRef(null);
    const canvasPixels = useRef(null);

    useEffect(() => {
        var ctxImg = canvasImg.current.getContext('2d');
        var ctxPixels = canvasPixels.current.getContext('2d');
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasImg.current.width = width -2;
        canvasImg.current.height = height -2;
        canvasPixels.current.width = width -2;
        canvasPixels.current.height = height -2;


        // Define the pixels array
        const pixels = [];
        let greyData;

        const mapImg = new Image();
        mapImg.src = './noiseMapEdges.png';
        mapImg.onload = () => {
            // Draw the map image onto the canvas
            ctxImg.drawImage(mapImg, 0, 0, width, height);

            // Read the color values of each pixel in the map image
            const imageData = ctxImg.getImageData(0, 0, width, height);
            greyData = imageData.data;

            for (let i = 0; i < pixelCount; i++) {
                let x = Math.floor(Math.random() * width);
                let y = Math.floor(Math.random() * height);
                const index = (x + y * width) * 4;
                const redX = greyData[index];
                const greenY = greyData[index + 1];
                const blueA = greyData[index + 2];
                console.log(redX, greenY, blueA);
                pixels.push({
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    ax: 0,
                    ay: 0,
                    color: Math.random() > 0.5 ? 'rgb(150,' + ((Math.random() * 30) + 120) + ',180)' : 'rgb(' + ((Math.random() * 10) + 150) + ', 230 , 250)'
                });
            }
            requestAnimationFrame(update);
        };

        function update() {
            ctxPixels.clearRect(0, 0, width, height);

            for (let i = 0; i < pixels.length; i++) {
                const p = pixels[i];

                // Update the acceleration of the pixel based on the grayscale value
                const x = Math.floor(p.x);
                const y = Math.floor(p.y);
                const index = (x + y * width) * 4;
                const redX = greyData[index];
                const greenY = greyData[index + 1];
                const blueA = greyData[index + 2];
                const angleX = (redX / 255 * Math.PI) - (Math.PI / 2);
                const angleY = (greenY / 255 * Math.PI) - (Math.PI / 2);
                p.ax = pixelAcc * blueA / 255 * Math.sin(angleX);
                p.ay = pixelAcc * blueA / 255 * Math.sin(angleY);

                p.vx = p.vx + p.ax;
                p.vy = p.vy + p.ay;
                //update velocity without going over or below max velocity
                if (p.vx > vMax) {
                    p.vx = vMax;
                } else if (p.vx < -vMax) {
                    p.vx = -vMax;
                }
                if (p.vy > vMax) {
                    p.vy = vMax;
                } else if (p.vy < -vMax) {
                    p.vy = -vMax;
                }

                // Update the position of the pixel based on the velocity
                p.x += p.vx;
                p.y += p.vy;

                // Wrap the pixel around the canvas if it goes outside the bounds
                if (p.x < 0) {
                    p.x = 1;
                    p.vx = -p.vx;
                } else if (p.x > width) {
                    p.x = width - 1;
                    p.vx = -p.vx;
                }
                if (p.y < 0) {
                    p.y = 1;
                    p.vy = -p.vy;
                } else if (p.y > height) {
                    p.y = height - 1;
                    p.vy = -p.vy;
                }

                // Draw the pixel on the canvas

                ctxPixels.fillStyle = p.color;
                ctxPixels.fillRect(p.x, p.y, pixelSize, pixelSize);
                // Request the next frame
            }
            requestAnimationFrame(update);
        }

    },[]);

    return (
    <div>
        <canvas ref={canvasImg} className={styles.c}/>
        <canvas ref={canvasPixels} className={styles.d}/>
    </div>
  )
}
