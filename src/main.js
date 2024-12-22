import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as dat from 'lil-gui'
import {gsap} from 'gsap'
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColor = textureLoader.load('./textures/door/color.jpg');
const doorAlpha = textureLoader.load('./textures/door/alpha.jpg');
const doorAmbient = textureLoader.load('./textures/door/ambientOcclusion.jpg');
const doorHeight = textureLoader.load('./textures/door/height.jpg');
const doorNormal = textureLoader.load('./textures/door/normal.jpg');
const doorMetalness = textureLoader.load('./textures/door/metalness.jpg');
const doorRoughness = textureLoader.load('./textures/door/roughness.jpg');

const brickColor = textureLoader.load('./textures/bricks/color.jpg');
const brickAmbient = textureLoader.load('./textures/bricks/ambientOcclusion.jpg');
const brickNormal = textureLoader.load('./textures/bricks/normal.jpg');
const brickRoughness = textureLoader.load('./textures/bricks/roughness.jpg');

const grassColor = textureLoader.load('./textures/grass/color.jpg');
const grassAmbient = textureLoader.load('./textures/grass/ambientOcclusion.jpg');
const grassNormal = textureLoader.load('./textures/grass/normal.jpg');
const grassRoughness = textureLoader.load('./textures/grass/roughness.jpg');

grassColor.repeat.set(8, 8);
grassAmbient.repeat.set(8, 8);
grassNormal.repeat.set(8, 8);
grassRoughness.repeat.set(8, 8);

grassColor.wrapS = THREE.RepeatWrapping;
grassAmbient.wrapS = THREE.RepeatWrapping;
grassNormal.wrapS = THREE.RepeatWrapping;
grassRoughness.wrapS = THREE.RepeatWrapping;

grassColor.wrapT = THREE.RepeatWrapping;
grassAmbient.wrapT = THREE.RepeatWrapping;
grassNormal.wrapT = THREE.RepeatWrapping;
grassRoughness.wrapT = THREE.RepeatWrapping;

doorColor.generateMipmaps = false;
doorColor.minFilter = THREE.NearestFilter;
doorColor.magFilter = THREE.NearestFilter;

// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog(0x263F71, 1, 15);
scene.fog = fog; 


/**  
 * Materials
*/
const doorMaterial = new THREE.MeshStandardMaterial({
    map: doorColor,
    transparent: true,
    alphaMap: doorAlpha,
    aoMap: doorAmbient,
    displacementMap: doorHeight,
    displacementScale: .12,
    normalMap: doorNormal,
    metalnessMap: doorMetalness,
    roughnessMap: doorRoughness   
});

const wallMaterial = new THREE.MeshStandardMaterial({
    map: brickColor,
    aoMap: brickAmbient,
    normalMap: brickNormal,
    roughnessMap: brickRoughness   
});

const groundMaterial = new THREE.MeshStandardMaterial({
    map: grassColor,
    aoMap: grassAmbient,
    normalMap: grassNormal,
    roughnessMap: grassRoughness   
});


/**
 * Meshes
 */
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3.5), wallMaterial);
walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array), 2);
walls.position.y = 1.25;
house.add(walls);

// Ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), groundMaterial);
ground.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(ground.geometry.attributes.uv.array), 2);
ground.rotation.x = - Math.PI * .5;
scene.add(ground);

// Roof
const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.5, 4, 4), new THREE.MeshStandardMaterial({color: 0xC80000}));
roof.position.set(0, 3, 0);
roof.rotation.y = Math.PI * .25;
house.add(roof);

// Door
const door = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2, 100, 100), doorMaterial);
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array), 2);
door.position.set(0, 1, 1.751); 
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({color: 0x00FF00});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(.5, .5 , .5);
bush1.position.set(.8, .2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(.25, .25 , .25);
bush2.position.set(1.4, .1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(.15, .15 , .15);
bush3.position.set(-1, .1, 2.3);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(.4, .4 , .4);
bush4.position.set(-.9, .1, 1.9);

scene.add(bush1, bush2, bush3, bush4);

// Graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(.7, .9, .15);
const graveMaterial = new THREE.MeshStandardMaterial({color: 0xC3BEBE});
for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 7;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, .3, z);
    grave.rotation.y = (Math.random() - .5) * Math.PI * .1;
    grave.rotation.z = (Math.random() - .5) * Math.PI * .05;
    graves.add(grave);
};

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0x6D7E9F, .09);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x6D7E9F, .09);
directionalLight.position.set(2, 2, 2);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Door light
const doorLight = new THREE.PointLight(0xDF6D6D, .5, 7);
doorLight.position.set(0, 2.3, 2.2);
house.add(doorLight);

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

window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    }
    else {
        document.exitFullscreen();
    }
});

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, .1, 100);
camera.position.set(1.5, 2, 4.5);
scene.add(camera);

/**
 * Renderer
 */
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer ({
    canvas:canvas
});
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
/**
 * Match the renderer pixel ratio to the screen's pixel ratio if the latter is greater than 1
 * Removes blurriness and stairs effect on edges 
 * Sets the max possible pixel ratio to 2 to improve performance 
 */
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x263F71);

const clock = new THREE.Clock;

/**
 * Initializing orbit controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI()
gui.add(directionalLight.position, 'x').min(-10).max(10).step(.0001);
gui.add(directionalLight.position, 'y').min(-10).max(10).step(.0001);
gui.add(directionalLight.position, 'z').min(-10).max(10).step(.0001);

function tick() {
    console.log("tick");
    const elapsedTime = clock.getElapsedTime()*.5;

    controls.update();

    /* plane.position.y = Math.sin(elapsedTime);
    plane.position.x = Math.cos(elapsedTime); */

    // plane.rotation.y += .01;

/*  camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    camera.position.y = cursor.y * 5; 
 
    camera.lookAt(plane.position); */
    
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
