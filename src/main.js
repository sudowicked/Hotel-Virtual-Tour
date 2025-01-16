import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

// Scene
const scene = new THREE.Scene();

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.set(0, -1, 4);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0xBC79FF);

/**
 * MAIN CODE
 */

// Meshes
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: 0x6B6B6B}));
floor.rotation.x = - Math.PI * .5;
floor.position.y = -2;
scene.add(floor);

const modelLoader = new GLTFLoader();
let mixer = null;

modelLoader.load(
  "./meshes/apoman.glb",
  (model) =>
  {
    mixer = new THREE.AnimationMixer(model.scene);
    const action = mixer.clipAction(model.animations[0]);
    action.play();
    
    scene.add(model.scene.children[0]);
  }
);

// Lights
const ambient = new THREE.AmbientLight(0xBC79FF, 1);
scene.add(ambient);

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
})

const clock = new THREE.Clock();
let previousTime = 0;

// Tick function
function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (mixer) {
        mixer.update(deltaTime);
    }
    
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();