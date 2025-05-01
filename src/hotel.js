import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { LoadGLTFByPath, getOBjectByName, mixer, doorOpenAction, fanSpinAction1, fanSpinAction2, doorHandleAction, model, montanaAction } from '../static/libs/ModelHelper';
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
import { getParticleSystem } from '../static/libs/getParticleSystem';

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

let yaw = 0;
let pitch = 0;
let yawVelocity = 0;
let pitchVelocity = 0;

const rotationSpeed = 0.00002;
const damping = 0.95; // lower = more inertia

const cameraTarget = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
    const deltaX = event.movementX || 0;
    const deltaY = event.movementY || 0;

    // Inverted direction for orbit feel
    yawVelocity += deltaX * rotationSpeed;
    pitchVelocity -= deltaY * rotationSpeed;
});


// Renderer
const canvas = document.querySelector('.webgl');
const container = document.querySelector('.fullscreen-container');
const renderer = setupRenderer();   
let composer;

renderer.setClearColor('#000000');

/**
 * MAIN CODE
 */

// Meshes       
await LoadGLTFByPath(scene, hotelPath);

let curvePath = await loadCurveFromJSON(curvePathJSON);
// scene.add(curvePath.mesh);

// Fan spin animation
function playAnim () {
    fanSpinAction1.play();
    fanSpinAction2.play();
};
playAnim();

montanaAction.play();

// CameraList
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.copy(curvePath.curve.getPointAt(0));
camera.lookAt(curvePath.curve.getPointAt(0.99));
scene.add(camera);

// TV video element
let video = document.getElementById('video');
let videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

const lcd = model.children[50];
video.play();
console.log(lcd.children[1].geometry.groups)
lcd.children[1].material = new THREE.MeshBasicMaterial({ map: videoTexture });


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

// Smoke particles
const pipePosition = model.children[24].position;

const smokeEffect = getParticleSystem({
    camera,
    emitter: new THREE.Vector3(pipePosition.x - .1, pipePosition.y + .36, pipePosition.z - .2),
    parent: scene,
    rate: 50,
    texture: './textures/img/smoke.png',
});


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
container.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        container.requestFullscreen();    }
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

    // Updates
    updatePosition(curvePath, camera, positionAlongPathState);
    smokeEffect.update(0.026);
    // controls.update();

    // Animation update
    if (mixer) mixer.update(deltaTime);

    // Get normalized splinePos in [0, 1]
    let splinePos = -(positionAlongPathState.currentDistanceOnPath % 1);
    if (splinePos < 0) splinePos += 1;

    // Door should be open between 0.28 and 0.6
    const inRoom = splinePos > 0.28 && splinePos < 0.9;

    console.log(splinePos);

    if (inRoom && !doorOpen) {
        doorOpenAction.timeScale = 1;
        doorOpenAction.reset();
        doorOpenAction.play();

        doorHandleAction.timeScale = 1;
        doorHandleAction.reset();
        doorHandleAction.play();

        doorOpen = true;
    } else if (!inRoom && doorOpen) {
        doorOpenAction.reset();
        doorOpenAction.time = 1.3;
        doorOpenAction.timeScale = -1;
        doorOpenAction.play();

        doorHandleAction.reset();
        doorHandleAction.time = 1;
        doorHandleAction.timeScale = -1;
        doorHandleAction.play();

        doorOpen = false;
    };


    // const parallaxX = mouse.x * .1;
    // const parallaxY = mouse.y * .1;

    // model.rotation.y += (parallaxX - model.rotation.y) * deltaTime;
    // model.rotation.z += (parallaxY - model.rotation.z) * deltaTime;

    // Get normalized t in [0, 1]
    let t = positionAlongPathState.currentDistanceOnPath % 1;
    if (t < 0) t += 1;

    // Move camera along path
    const pointOnPath = curvePath.curve.getPointAt(t);
    camera.position.copy(pointOnPath);

    // Get tangent to align the base direction
    const tangent = curvePath.curve.getTangentAt(t).normalize();

    // Y-axis up vector
    const up = new THREE.Vector3(0, 1, 0);

    // Create base rotation to align with tangent
    const baseQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, -1), // default forward
        tangent
    );

    // Update yaw/pitch with inertia
    yaw += yawVelocity;
    pitch += pitchVelocity;

    yawVelocity *= damping;
    pitchVelocity *= damping;

    // Clamp pitch
    const pitchLimit = Math.PI / 2 - 0.1;
    pitch = THREE.MathUtils.clamp(pitch, -pitchLimit, pitchLimit);

    // Build rotation around base forward direction
    const tempObject = new THREE.Object3D();
    tempObject.quaternion.copy(baseQuat);

    // Apply yaw (around world Y)
    tempObject.rotateOnWorldAxis(up, yaw);

    // Apply pitch (around local X)
    tempObject.rotateX(pitch);

    // Set camera to look in that direction
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(tempObject.quaternion);
    cameraTarget.copy(camera.position).add(direction);
    camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);

    // Post processing update
    composer.render();
};
tick();