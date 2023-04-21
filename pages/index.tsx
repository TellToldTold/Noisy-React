import styles from '@/styles/Home.module.css'
import {useEffect, useRef, useState} from "react";

const pixelSize = 2;
const pixelCount = 10000;
const pixelAcc = 0.3;
const vMax = 3;
const changeMapTimer = 2000;

var ctx;
var width;
var height;
const pixels = [];

export default function Home() {
    const canvas = useRef(null);
    const [maps, setMaps] = useState([]);
    const counter = useRef(0);

    useEffect(() => {
        ctx = canvas.current.getContext('2d');
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.current.width = width -2;
        canvas.current.height = height -2;

        let mps = [];

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const mapImg = new Image();
                mapImg.src = src;
                mapImg.onload = () => {
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(mapImg, 0, 0, width, height);

                    // Read the color values of each pixel in the map image
                    const imageData = ctx.getImageData(0, 0, width, height);
                    mps.push(imageData.data);
                    resolve();
                }
            });
        }

        async function loadMaps() {
            //const mapNames = ['map1.png', 'map12.png', 'map2.png', 'map23.png', 'map3.png', 'map34.png', 'map4.png', 'map41.png'];
            //const mapNames = ['1.png', '12.png', '2.png', '23.png', '3.png', '34.png', '4.png', '41.png'];
            const mapNames = ['a.png', 'ab.png', 'b.png', 'bc.png', 'c.png', 'cd.png', 'd.png', 'de.png', 'e.png', 'ef.png', 'f.png', 'fg.png', 'g.png', 'ga.png'];
            const promises = mapNames.map(name => loadImage(`./noiseMaps/${name}`));
            await Promise.all(promises);
            setMaps(mps);
        }

        loadMaps();

    },[]);

    useEffect(() => {
        ctx = canvas.current.getContext('2d')
        if (maps.length !== 0) {
            for (let i = 0; i < pixelCount; i++) {
                let x = Math.floor(Math.random() * width);
                let y = Math.floor(Math.random() * height);
                pixels.push({
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    ax: 0,
                    ay: 0,
                    color: Math.random() > 0.5 ? 'rgb(150,' + ((Math.random() * 20) + 120) + ',180)' : 'rgb(' + ((Math.random() * 20) + 145) + ', 230 , 250)'
                });
            }
            update();
        }
    },[maps]);


    const update = () => {
        ctx.clearRect(0, 0, width, height);

        const map = maps[counter.current % maps.length];

        for (let i = 0; i < pixels.length; i++) {
            const p = pixels[i];

            // Update the acceleration of the pixel based on the grayscale value
            const x = Math.floor(p.x);
            const y = Math.floor(p.y);
            const index = (x + y * width) * 4;
            const redX = map[index];
            const greenY = map[index + 1];
            const blueA = map[index + 2];
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

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
        }

        requestAnimationFrame(update);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            counter.current = counter.current + 1;
        }, changeMapTimer);

        return () => clearInterval(interval);
    }, [maps]);

    return (
        <div>
            <canvas ref={canvas} className={styles.d}/>
        </div>
    )
}
