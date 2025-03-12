import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { LoadGLTFByPath, getOBjectByName, mixer, doorOpenAction, fanSpinAction1, fanSpinAction2, doorHandleAction } from '../static/libs/ModelHelper';
import { gsap } from 'gsap/gsap-core';
import { loadCurveFromJSON} from '../static/libs/CurveMethods'
import PositionAlongPathState from '../static/libs/positionAlongPathTools/PositionAlongPathState';
import { handleScroll, updatePosition, isScrolling} from '../static/libs/positionAlongPathTools/PositionAlongPathMethods';
import * as dat from 'lil-gui';
import { setupRenderer } from '../static/libs/RendererHelper';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

// Scene
const scene = new THREE.Scene();

// Paths
const hotelPath = './meshes/cyber/cyber.glb'
const curvePathJSON = './meshes/cyber/cyberPath.json'

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
let composer;


// renderer.setClearColor('#FFD94F');

/**
 * MAIN CODE
 */

// Meshes       
await LoadGLTFByPath(scene, hotelPath);

let curvePath = await loadCurveFromJSON(curvePathJSON);
// scene.add(curvePath.mesh);

function playAnim () {
    fanSpinAction1.play();
    fanSpinAction2.play();
};
playAnim();
// CameraList
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.copy(curvePath.curve.getPointAt(0));
camera.lookAt(curvePath.curve.getPointAt(0.99));
scene.add(camera);

const params = {
    threshold: 0,
    strength: .183,
    radius: 0,
    exposure: 1
};

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );
composer.addPass( outputPass );
composer.renderTarget1.samples = 8;
composer.renderTarget2.samples = 8;

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
const rectLight = new THREE.RectAreaLight('#FFA000', 4, 10, 10);
const rectLightHelper = new RectAreaLightHelper(rectLight);
rectLight.position.set(7, 10, -2);
rectLight.lookAt(new THREE.Vector3(0, 0, 0))

// scene.add(rectLight);

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Debug

// const gui = new dat.GUI();


// const bloomFolder = gui.addFolder( 'bloom' );

// bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

//     bloomPass.threshold = Number( value );

// } );

// bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

//     bloomPass.strength = Number( value );

// } );

// gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

//     bloomPass.radius = Number( value );

// } );

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

let doorOpen = false;
// Tick function
function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animation
    if (mixer) {
        mixer.update(deltaTime);
    }
    console.log(positionAlongPathState.targetDistance)
    if (Math.abs(positionAlongPathState.currentDistanceOnPath) > .28) {
        if (!doorOpen) {
            doorOpenAction.timeScale = 1;
            doorOpenAction.reset();
            doorOpenAction.play();

            doorHandleAction.timeScale = 1;
            doorHandleAction.reset();
            doorHandleAction.play();
            doorOpen = true;
        }
    } else if (Math.abs(positionAlongPathState.currentDistanceOnPath) < .28) {
        if (doorOpen) {
            doorOpenAction.reset();
            doorOpenAction.time = 1.3;
            doorOpenAction.timeScale = -1;
            doorOpenAction.play();

            doorHandleAction.reset();
            doorHandleAction.time = 1;
            doorHandleAction.timeScale = -1;
            doorHandleAction.play();


            doorOpen = false;
        }
    };

    updatePosition(curvePath, camera, positionAlongPathState);
    // controls.update();

    // console.log(isScrolling)
    
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    composer.render();
};
tick();