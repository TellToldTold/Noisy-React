import styles from '@/styles/Home.module.css'
import {useEffect, useRef, useState} from "react";

const pixelSize = 2;
const pixelAcc = 0.05 / 255;
const vMax = 0.65;
const changeMapTimer = 1000;
const pixelCounts = [3000,1000,100,1000,4000];
const colors = ['rgb(171,130,180)', 'rgb(176,144,196)', 'rgb(133,185,204)',
    'rgb(113,174,197)', 'rgb(155,230,250)'];

const PI255 = 0.8117;
var width;
var height;
const sinTable = [];
var ctxImg;
const ctxs = [];
const pixels = [];

export default function Home() {
    const canvasImg = useRef(null);
    const canvas1 = useRef(null);
    const canvas2 = useRef(null);
    const canvas3 = useRef(null);
    const canvas4 = useRef(null);
    const canvas5 = useRef(null);
    const [maps, setMaps] = useState([]);
    const counter = useRef(0);

    useEffect(() => {
        for (let angle = -Math.PI / 2; angle <= Math.PI / 2; angle += 0.01) {
            sinTable.push(Math.sin(angle));
        }

        ctxImg = canvasImg.current.getContext('2d');
        width = window.innerWidth;
        height = window.innerHeight;
        canvasImg.current.width = width;
        canvasImg.current.height = height;
        canvas1.current.width = width;
        canvas1.current.height = height;
        canvas2.current.width = width;
        canvas2.current.height = height;
        canvas3.current.width = width;
        canvas3.current.height = height;
        canvas4.current.width = width;
        canvas4.current.height = height;
        canvas5.current.width = width;
        canvas5.current.height = height;

        let mps = [];

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const mapImg = new Image();
                mapImg.src = src;
                mapImg.onload = () => {
                    ctxImg.clearRect(0, 0, width, height);
                    ctxImg.drawImage(mapImg, 0, 0, width, height);

                    // Read the color values of each pixel in the map image
                    const imageData = ctxImg.getImageData(0, 0, width, height);
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
        if (maps.length !== 0) {
            ctxs.push(canvas1.current.getContext('2d'));
            ctxs.push(canvas2.current.getContext('2d'));
            ctxs.push(canvas3.current.getContext('2d'));
            ctxs.push(canvas4.current.getContext('2d'));
            ctxs.push(canvas5.current.getContext('2d'));
            //ctx.transform = 'translate3d(0, 0, 0)';

            for (let j = 0; j < 5; j++) {
                pixels.push([]);
                for (let i = 0; i < pixelCounts[j]; i++) {
                    let x = Math.floor(Math.random() * width);
                    let y = Math.floor(Math.random() * height);
                    pixels[j].push({
                        x: x,
                        y: y,
                        vx: 0,
                        vy: 0,
                    });
                }
                ctxs[j].fillStyle = colors[j];
            }
            ctxImg.clearRect(0, 0, width, height);
            update();
        }
    },[maps]);


    const update = () => {
        const map = maps[counter.current % maps.length];

        for (let j = 0; j < 5; j++) {
            ctxs[j].clearRect(0, 0, width, height);
            //ctx.transform = 'translate3d(0, 0, 0)';

            for (let i = 0; i < pixelCounts[j]; i++) {
                const p = pixels[j][i];

                // Update the acceleration of the pixel based on the grayscale value
                const x = Math.floor(p.x);
                const y = Math.floor(p.y);
                const index = (x + y * width) * 4;
                const redX = map[index];
                const greenY = map[index + 1];
                const blueA = map[index + 2];
                const angleX =  Math.round(redX / PI255);
                const angleY = Math.round(greenY / PI255);
                p.ax = pixelAcc * blueA * sinTable[angleX];
                p.ay = pixelAcc * blueA * sinTable[angleY];

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

                if (p.x > width) {
                    p.x = width - 1;
                    p.vx *= -1;
                } else if (p.x < 0) {
                    p.x = 0;
                    p.vx *= -1;
                }
                if (p.y > height) {
                    p.y = height - 1;
                    p.vy *= -1;
                } else if (p.y < 0) {
                    p.y = 0;
                    p.vy *= -1;
                }

                ctxs[j].fillRect(p.x, p.y, pixelSize, pixelSize);
            }
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
            <canvas ref={canvasImg} className={styles.backLayer}/>
            <canvas ref={canvas1} className={styles.layer1}/>
            <canvas ref={canvas2} className={styles.layer2}/>
            <canvas ref={canvas3} className={styles.layer3}/>
            <canvas ref={canvas4} className={styles.layer4}/>
            <canvas ref={canvas5} className={styles.layer5}/>
        </div>
    )
}
