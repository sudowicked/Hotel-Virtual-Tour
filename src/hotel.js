import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { LoadGLTFByPath, getOBjectByName } from '../static/libs/ModelHelper';
import { gsap } from 'gsap/gsap-core';
import { loadCurveFromJSON} from '../static/libs/CurveMethods'
import PositionAlongPathState from '../static/libs/positionAlongPathTools/PositionAlongPathState';
import { handleScroll, updatePosition, isScrolling} from '../static/libs/positionAlongPathTools/PositionAlongPathMethods';
import * as dat from 'lil-gui';
import { setupRenderer } from '../static/libs/RendererHelper';

// Scene
const scene = new THREE.Scene();

// Paths
const hotelPath = './meshes/hotelRoom/room_final.glb'
const curvePathJSON = './meshes/hotelRoom/roomPath.json'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Mouse
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = setupRenderer();   
// renderer.setClearColor('#FFD94F');

/**
 * MAIN CODE
 */

// Meshes       
await LoadGLTFByPath(scene, hotelPath);

let curvePath = await loadCurveFromJSON(curvePathJSON);
// scene.add(curvePath.mesh);

// CameraList
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.copy(curvePath.curve.getPointAt(0));
camera.lookAt(curvePath.curve.getPointAt(0.99));
scene.add(camera);

// PathState
let positionAlongPathState = new PositionAlongPathState();

window.addEventListener('wheel', (event) => {
    handleScroll(event, positionAlongPathState);
});

window.addEventListener('touchstart', (event) => {
    handleTouchStart(event);
});

window.addEventListener('touchmove', (event) => {
    handleScroll(event, positionAlongPathState);
    event.preventDefault();
    }, 
    {passive: false}
);


// Lights
const spotLight = new THREE.SpotLight('#ffffff', 10);
spotLight.position.set(3.8, 3.2, -3.5);
// scene.add(spotLight);

// Orbit controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// Debug
// const gui = new dat.GUI();
// gui.add(spotLight, 'intensity').min(0).max(10).step(.001).name('lightIntensity');
// gui.add(spotLight.position, 'x').min(-5).max(10).step(.001).name('lightX');
// gui.add(spotLight.position, 'y').min(-5).max(10).step(.001).name('lightY');
// gui.add(spotLight.position, 'z').min(-5).max(10).step(.001).name('lightZ');

// Window resize
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

// Double click function
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    }
    else {
        document.exitFullscreen();
    }
});

const clock = new THREE.Clock();
let previousTime = 0;

// Tick function
function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    updatePosition(curvePath, camera, positionAlongPathState);

    // console.log(isScrolling)
    
    // controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();