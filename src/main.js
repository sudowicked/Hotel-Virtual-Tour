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
camera.position.set(0, 6, 6);
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

// Meshes

// Particles
const parameters = {
    count: 100000,
    size: .02,
    radius: 5,
    branches: 5,
    spin: 1,
    power: 5,
    insideColor: 0xf46b10,
    outsideColor: 0xfa0000
};

let geometry = null;
let material = null;
let galaxyPoints = null; 

function galaxy() {
    // Remove old galaxy
    if (galaxyPoints !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(galaxyPoints);
    };

    // Geometry
    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX =(Math.pow(Math.random(), parameters.power)) * (Math.random() < .5 ? 1 : -1);
        const randomY =(Math.pow(Math.random(), parameters.power)) * (Math.random() < .5 ? 1 : -1);
        const randomZ =(Math.pow(Math.random(), parameters.power)) * (Math.random() < .5 ? 1 : -1);

        positions[i3] = (Math.cos(branchAngle + spinAngle) ) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = (Math.sin(branchAngle + spinAngle) ) * radius + randomZ;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    };

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material Sroubis Labrinos!!
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    galaxyPoints = new THREE.Points(geometry, material);
    scene.add(galaxyPoints);
};
galaxy();

// Debug
const gui = new dat.GUI();
gui.add(parameters, 'count').min(0).max(100000).step(100).onFinishChange(galaxy);
gui.add(parameters, 'size').min(0.01).max(.1).step(.01).onFinishChange(galaxy);
gui.add(parameters, 'radius').min(0.1).max(10).step(.01).onFinishChange(galaxy);
gui.add(parameters, 'branches').min(1).max(20).step(1).onFinishChange(galaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(.1).onFinishChange(galaxy);
gui.add(parameters, 'power').min(0).max(8).step(1).onFinishChange(galaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(galaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(galaxy);

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

    galaxyPoints.rotation.y = - elapsedTime * .2;
    
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();