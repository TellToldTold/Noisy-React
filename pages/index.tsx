import styles from '@/styles/Home.module.css'
import {useEffect, useRef} from "react";

const accelerationAngle = Math.PI / 2;

export default function Home() {
    const canvasImgX = useRef(null);
    const canvasImgY = useRef(null);
    const canvasPixels = useRef(null);

    useEffect(() => {
        var ctxImgX = canvasImgX.current.getContext('2d');
        var ctxImgY = canvasImgY.current.getContext('2d');
        var ctxPixels = canvasPixels.current.getContext('2d');
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasImgX.current.width = width -2;
        canvasImgX.current.height = height -2;
        canvasImgY.current.width = width -2;
        canvasImgY.current.height = height -2;
        canvasPixels.current.width = width -2;
        canvasPixels.current.height = height -2;


        // Define the pixels array
        const pixels = [];
        let greyDataX, greyDataY;

        const mapImgX = new Image();
        mapImgX.src = './map.png';
        mapImgX.onload = () => {
            // Draw the map image onto the canvas
            ctxImgX.drawImage(mapImgX, 0, 0, width, height);

            // Read the color values of each pixel in the map image
            const imageData = ctxImgX.getImageData(0, 0, width, height);
            greyDataX = imageData.data;

            for (let i = 0; i < 10000; i++) {
                let x = Math.floor(Math.random() * width);
                let y = Math.floor(Math.random() * height);
                //const index = (x + y * width) * 4;
                //const grayscale = greyDataX[index];
                //const angle = (grayscale / 128 * Math.PI) - Math.PI;
                //console.log("angle: " + angle + " grayscale: " + grayscale + " x: " + x + " y: " + y);
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

            const mapImgY = new Image();
            mapImgY.src = './map1.png';
            mapImgY.onload = () => {
                ctxImgY.drawImage(mapImgY, 0, 0, width, height);
                const imageData = ctxImgY.getImageData(0, 0, width, height);
                greyDataY = imageData.data;
                // Start the animation loop
                requestAnimationFrame(update);
            };
        };

        function update() {
            ctxPixels.clearRect(0, 0, width, height);

            for (let i = 0; i < pixels.length; i++) {
                const p = pixels[i];

                // Update the acceleration of the pixel based on the grayscale value
                const x = Math.floor(p.x);
                const y = Math.floor(p.y);
                const index = (x + y * width) * 4;
                const grayscaleX = greyDataX[index];
                const grayscaleY = greyDataY[index];
                const angleX = (grayscaleX / 128 * Math.PI) - Math.PI;
                const angleY = (grayscaleY / 128 * Math.PI) - Math.PI;
                p.ax = 0.01 * Math.sin(angleX);
                p.ay = 0.01 * Math.sin(angleY);

                // Update the velocity of the pixel based on the acceleration
                p.vx += p.ax;
                p.vy += p.ay;

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
                ctxPixels.fillRect(p.x, p.y, 3, 3);
                // Request the next frame
            }
            requestAnimationFrame(update);
        }

    },[]);

    return (
    <div>
        <canvas ref={canvasImgX} className={styles.c}/>
        <canvas ref={canvasImgY} className={styles.c}/>
        <canvas ref={canvasPixels} className={styles.d1}/>
    </div>
  )
}
