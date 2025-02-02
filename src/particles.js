import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as dat from 'lil-gui';

// Scene
const scene = new THREE.Scene();

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.set(0, 2, 4);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

// Meshes


// Textures
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('./textures/particles/3.png');

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const count = 80000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - .5) * 3;
    colors[i] = Math.random();
};

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = .03;
particlesMaterial.sizeAttenuation = true;
// particlesMaterial.color = new THREE.Color(0xFF0095);
particlesMaterial.map = particleTexture;
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
particlesMaterial.alphaTest = .1;
particlesMaterial.depthWrite = false;
particlesMaterial.vertexColors = true;

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Debug
const gui = new dat.GUI();

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

// Tick function
function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Animation
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);

        

        particlesGeometry.attributes.position.needsUpdate = true;
    };

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();