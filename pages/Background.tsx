import styles from '@/styles/Background.module.css'
import {ReactNode, useEffect, useRef, useState} from "react";

const genRadius = 0.25;         // fraction of the screen minimum Dimension where the particles are generated
const changeMapTimer = 750;
const pixelSizes = [1.9, 1.925, 1.95, 1.975, 2];
const pixelAccs = [0.000026, 0.000027, 0.000028, 0.000029, 0.00003];
const vMaxs = [1.32, 1.37, 1.425, 1.48, 1.53];
const pixelCounts = [4000,4500,3000,4000,5000];
//const colors = ['rgba(199,155,185,0.92)', 'rgba(220,180,215,0.91)', 'rgba(156,234,245,0.93)',
//   'rgba(165,224,246,0.95)', 'rgb(161,233,255)'];
const colors = ['rgba(220,155,115,0.85)', 'rgba(218,175,121,0.85)', 'rgba(205,213,145,0.92)',
    'rgba(165,238,179,0.85)', 'rgba(149,238,207,0.86)'];
const mapNames = [  {name: 'a', trans: [ ['a.png', 'aab.png', 'ab.png', 'abb.png'], ['a.png', 'aac.png', 'ac.png', 'acc.png'] ]},
                    {name: 'b', trans: [ ['b.png', 'bbc.png', 'bc.png', 'bcc.png'], ['b.png', 'bbf.png', 'bf.png', 'bff.png']]},
                    {name: 'c', trans: [ ['c.png', 'ccd.png', 'cd.png', 'cdd.png'], ['c.png', 'ccb.png', 'cb.png', 'cbb.png']]},
                    {name: 'd', trans: [ ['d.png', 'dde.png', 'de.png', 'dee.png'], ['d.png', 'dda.png', 'da.png', 'daa.png']]},
                    {name: 'e', trans: [ ['e.png', 'eef.png', 'ef.png', 'eff.png'], ['e.png', 'eeg.png', 'eg.png', 'egg.png']]},
                    {name: 'f', trans: [ ['f.png', 'ffg.png', 'fg.png', 'fgg.png'], ['f.png', 'ffe.png', 'fe.png', 'fee.png']]},
                    {name: 'g', trans: [ ['g.png', 'gga.png', 'ga.png', 'gaa.png'], ['g.png', 'ggd.png', 'gd.png', 'gdd.png']]}];

const PI255 = 0.8117;
var width;
var height;
var minDim;
var radiusGeneration;
var lastTime = 0;
const sinTable = [];
var ctxImg;
const ctxs = [];
const pixels = [];

const Background = ( { children }: { children: ReactNode }) => {
    const canvasImg = useRef(null);
    const canvas1 = useRef(null);
    const canvas2 = useRef(null);
    const canvas3 = useRef(null);
    const canvas4 = useRef(null);
    const canvas5 = useRef(null);
    const loadingOverlay = useRef(null);
    const currentLetter = useRef('a');
    const currentSequence = useRef(Math.round(Math.random() * (mapNames[0].trans.length - 1)));
    const transIndex = useRef(0);
    const [nLoaded, setNLoaded] = useState(0);
    const [maps, setMaps] = useState({a: [[],[]], b: [[],[]], c: [[],[]], d: [[],[]], e: [[],[]], f: [[],[]], g: [[],[]]});

    // initialize the canvases and load the noise maps
    useEffect(() => {
        let mps = {a: [[],[]], b: [[],[]], c: [[],[]], d: [[],[]], e: [[],[]], f: [[],[]], g: [[],[]]};
        var loaded = 0;

        const loadImage = (name, letter, ind) => {
            return new Promise((resolve, reject) => {
                const mapImg = new Image();
                mapImg.src = `./noiseMaps/${name}`;
                mapImg.onload = () => {
                    loaded += 1;
                    setNLoaded(loaded);
                    ctxImg.clearRect(0, 0, width, height);
                    ctxImg.drawImage(mapImg, 0, 0, width, height);

                    // Read the color values of each pixel in the map image
                    const imageData = ctxImg.getImageData(0, 0, width, height);
                    mps[letter][ind].push(imageData.data);
                    resolve();
                }
            });
        }

        async function loadMaps() {
            const promises = [];
            mapNames.forEach(map => {
                map.trans.forEach((list, ind) => {
                    list.forEach(name => promises.push(loadImage(name, map.name, ind)));
                });
            });
            await Promise.all(promises);
        }

        ctxImg = canvasImg.current.getContext('2d');
        width = window.innerWidth;
        height = window.innerHeight;
        minDim = Math.min(width, height);
        radiusGeneration = minDim * genRadius;
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

        for (let angle = -Math.PI / 2; angle <= Math.PI / 2; angle += 0.01) {
            sinTable.push(Math.sin(angle));
        }

        loadMaps().then(() => {
                console.log('done loading');
                setMaps(mps);
            }
        );
    },[]);

    // initialize the pixels and start the animation
    useEffect(() => {
        if (maps['a'][0].length > 0) {
            ctxs.push(canvas1.current.getContext('2d'));
            ctxs.push(canvas2.current.getContext('2d'));
            ctxs.push(canvas3.current.getContext('2d'));
            ctxs.push(canvas4.current.getContext('2d'));
            ctxs.push(canvas5.current.getContext('2d'));
            //ctx.transform = 'translate3d(0, 0, 0)';

            for (let j = 0; j < 5; j++) {
                pixels.push([]);
                for (let i = 0; i < pixelCounts[j]; i++) {
                    let x = 0;
                    let y = 0;
                    do {
                        x = width/2 - radiusGeneration + Math.floor(Math.random() * 2 * radiusGeneration);
                        y = height/2 -  radiusGeneration + Math.floor(Math.random() * 2 * radiusGeneration);
                    } while (Math.hypot(x - width/2, y - height/2) >  radiusGeneration);

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
            loadingOverlay.current.animate(
                {
                    opacity: [1, 0],
                },
                { duration: 400, fill: 'forwards' }
            );
            update(0);
        }
    },[maps]);

    // change the noise map every changeMapTimer ms
    useEffect(() => {
        const interval = setInterval(() => {
            if (transIndex.current == 3) {
                currentLetter.current = mapNames.find(m => m.name == currentLetter.current).trans[currentSequence.current][transIndex.current][2];
                transIndex.current = 0;
                currentSequence.current = Math.round(Math.random()  * (mapNames[0].trans.length - 1));
            } else {
                transIndex.current = transIndex.current + 1;
            }
        }, changeMapTimer);

        return () => clearInterval(interval);

    }, [maps]);

    // update the position of the pixels
    const update = (time) => {
        const dt = time - lastTime;
        lastTime = time;
        const map = maps[currentLetter.current][currentSequence.current][transIndex.current];

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
                p.ax = pixelAccs[j] * blueA * sinTable[angleX];
                p.ay = pixelAccs[j] * blueA * sinTable[angleY];

                p.vx = p.vx + p.ax * dt;
                p.vy = p.vy + p.ay * dt;
                //update velocity without going over or below max velocity
                if (p.vx > vMaxs[j]) {
                    p.vx = vMaxs[j];
                } else if (p.vx < -vMaxs[j]) {
                    p.vx = -vMaxs[j];
                }
                if (p.vy > vMaxs[j]) {
                    p.vy = vMaxs[j];
                } else if (p.vy < -vMaxs[j]) {
                    p.vy = -vMaxs[j];
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
                ctxs[j].fillRect(p.x, p.y, pixelSizes[j], pixelSizes[j]);
            }
        }

        requestAnimationFrame(update);
    }

    return (
        <div className={styles.rootDiv}>
            <canvas ref={canvasImg} className={styles.backLayer}/>
            <div className={styles.blob}/>
            <div className={styles.blobWhite}/>
            <div className={styles.blur}/>
            <canvas ref={canvas1} className={styles.layer}/>
            <canvas ref={canvas2} className={styles.layer}/>
            <canvas ref={canvas3} className={styles.layer}/>
            <canvas ref={canvas4} className={styles.layer}/>
            <canvas ref={canvas5} className={styles.layer}/>

            {children}

            <div ref={loadingOverlay} className={styles.loading }>
                LOADING
                <div className={styles.loadingBarContainer}>
                    <div className={styles.loadingBar} style={{width:`${nLoaded * 1.8}px`}}/>
                </div>
            </div>
        </div>
    )
}

export default Background;