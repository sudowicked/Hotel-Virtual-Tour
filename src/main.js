import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { gsap } from 'gsap/gsap-core';

// Scene
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Mouse
const mouse = new THREE.Vector2();

// Camera
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.set(0, -1, 7);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x160000);

/**
 * MAIN CODE
 */

// Meshes
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: 0x6B6B6B}));
floor.rotation.x = - Math.PI * .5;
floor.position.y = -4;
scene.add(floor);

const modelLoader = new GLTFLoader();
let model = null;
let mixer = null;
let action = null;
let currentIntersect = null;

modelLoader.load(
  "./meshes/apoman.glb",
  (gltf) =>
  {
    model = gltf.scene;
    mixer = new THREE.AnimationMixer(gltf.scene);
    action = mixer.clipAction(gltf.animations[0]);
    action.setLoop( THREE.LoopOnce );
    action.clampWhenFinished = true; 
    scene.add(model);
  }
);

// Raycaster
const raycaster = new THREE.Raycaster();

// Lights
const ambient = new THREE.AmbientLight(0x160000, .8);
const rectLight = new THREE.RectAreaLight(0xE60000, 2, 4, 4);
rectLight.position.z = 7;
scene.add(ambient, rectLight);

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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

let inFocus = false;
// Mouse click function
window.addEventListener('click', () => {
    if (currentIntersect) {
        if (!inFocus) {
            // Animation handling
            gsap.to(model.scale, {duration:1, x:2});
            gsap.to(model.scale, {duration:1, y:2});
            gsap.to(model.scale, {duration:1, z:2});
        
            gsap.to(model.position, {duration:1, z:2});

            gsap.to(model.rotation, {duration:2, x:Math.PI * .15});
            
            // Facial animation handling
            inFocus = true;
            action.timeScale = 1;
            action.reset();
            action.play();
        }
        else {
            gsap.to(model.scale, {duration:1, x:1});
            gsap.to(model.scale, {duration:1, y:1});
            gsap.to(model.scale, {duration:1, z:1});

            gsap.to(model.position, {duration:1, z:-2});

            gsap.to(model.rotation, {duration:2, x: 0});

            inFocus = false;
            action.reset();
            action.time = 2;
            action.timeScale = -1;
            action.play();
        }
    }
});

const clock = new THREE.Clock();
let previousTime = 0;

// Tick function
function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (mixer) {
        mixer.update(deltaTime);
    };

    // Raycast
    raycaster.setFromCamera(mouse, camera);

    // Check if model is being hovered
    if (model) {
        const modelIntersects = raycaster.intersectObject(model);
        if (modelIntersects.length) {
            currentIntersect = modelIntersects;
        }
        else {
            currentIntersect = null;
        }
    };
    
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();