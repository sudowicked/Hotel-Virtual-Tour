import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as dat from 'lil-gui'
import {gsap} from 'gsap'
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const doorColor = textureLoader.load('./textures/door/color.jpg');
const doorAlpha = textureLoader.load('./textures/door/alpha.jpg');
const doorAmbient = textureLoader.load('./textures/door/ambientOcclusion.jpg');
const doorHeight = textureLoader.load('./textures/door/height.jpg');
const doorNormal = textureLoader.load('./textures/door/normal.jpg');
const doorMetalness = textureLoader.load('./textures/door/metalness.jpg');
const doorRoughness = textureLoader.load('./textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('./textures/matcaps/7.png');
const gradientTexture = textureLoader.load('./textures/3.png');

doorColor.generateMipmaps = false;
doorColor.minFilter = THREE.NearestFilter;
doorColor.magFilter = THREE.NearestFilter;
matcapTexture.generateMipmaps = false;
matcapTexture.minFilter = THREE.NearestFilter;
matcapTexture.magFilter = THREE.NearestFilter;

const environmentMapTexture = cubeTextureLoader.load([
    './textures/environmentMaps/0/nx.jpg',
    './textures/environmentMaps/0/px.jpg',
    './textures/environmentMaps/0/ny.jpg',
    './textures/environmentMaps/0/py.jpg',
    './textures/environmentMaps/0/nz.jpg',
    './textures/environmentMaps/0/pz.jpg',
])

const scene = new THREE.Scene();

/**  
 * Materials
*/

/* const material = new THREE.MeshBasicMaterial({map: doorColor});
material.transparent = true;
material.alphaMap = doorAlpha; */

/* const material = new THREE.MeshNormalMaterial();
material.normalMap = doorNormal;
material.side = THREE.DoubleSide;
material.flatShading = true; */

/* const material = new THREE.MeshMatcapMaterial();
material.matcap = matcapTexture; */

/* const material = new THREE.MeshDepthMaterial(); */

/* const material = new THREE.MeshStandardMaterial();
material.metalness = 0;
material.roughness = 1;
material.map = doorColor;
material.side = THREE.DoubleSide;
material.roughnessMap = doorRoughness;
material.metalnessMap = doorMetalness;
material.normalMap = doorNormal;
material.normalScale.set(.5, .5);
material.alphaMap = doorAlpha;
material.transparent = true;
material.displacementMap = doorHeight;
material.displacementScale = .08;
material.aoMap = doorAmbient;
material.aoMapIntensity = 1;  */

const material = new THREE.MeshStandardMaterial();
material.metalness = 1;
material.roughness = 0;
material.envMap = environmentMapTexture;
material.side = THREE.DoubleSide;

/**
 * Fonts
 */
const fontLoader = new FontLoader();

const doughnhuts = [];
const textMesh = new THREE.Mesh();
fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry('ShitSkata', {
            font:font,
            size: .5,
            depth: .125,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: .03,
            bevelSize: .02,
            bevelOffset: 0,
            bevelSegments: 4
        });

        textGeometry.center();
        const textMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture});
        // textMaterial.wireframe = true;
        // textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.geometry = textGeometry;
        textMesh.material = textMaterial;
        scene.add(textMesh);


        const torusGeometry = new THREE.TorusGeometry(.3, .2, 20, 45);
        for (let i = 0; i < 100; i++) {
            const dougnhutMesh = new THREE.Mesh(torusGeometry, textMaterial);
            dougnhutMesh.position.x = (Math.random() - .5) * 10;
            dougnhutMesh.position.y = (Math.random() - .5) * 10;
            dougnhutMesh.position.z = (Math.random() - .5) * 10;
            
            dougnhutMesh.rotation.x = Math.random() * Math.PI;
            dougnhutMesh.rotation.y = Math.random() * Math.PI;

            const scale = Math.random();
            dougnhutMesh.scale.set(scale, scale, scale);

            scene.add(dougnhutMesh);
            doughnhuts.push(dougnhutMesh);
        }

    }
);


/**
 * Meshes
 */
/* const sphere = new THREE.Mesh(new THREE.SphereGeometry(.5, 64, 64), material);
sphere.position.x = -1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));

const torus = new THREE.Mesh(new THREE.TorusGeometry(.3, .2, 64, 128), material);
torus.position.x = 1.5;

scene.add(sphere, torus, plane); */

const parameters = {
    color: 0xff0000,
    spin: () => {
        gsap.to(plane.rotation, {duration: 4, y: plane.rotation.y + Math.PI * 2, ease:'circ'});
    },
    reset: () => {
        gsap.to(plane.rotation, {duration: 6, y: 0, ease:'circ'});
    }
}

/**
 * Debug
 */
/* const gui = new dat.GUI();
gui.add(material, 'roughness').min(0).max(1).step(.0001);
gui.add(material, 'metalness').min(0).max(1).step(.0001); */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 0.9);
light.position.set(2,3,4);
scene.add(light);

const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, .1, 100);
camera.position.z = 4;
scene.add(camera);

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
})

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer ({
    canvas:canvas
});

renderer.setSize(sizes.width, sizes.height);

/**
 * Match the renderer pixel ratio to the screen's pixel ratio if the latter is greater than 1
 * Removes blurriness and stairs effect on edges 
 * Sets the max possible pixel ratio to 2 to improve performance 
 */
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const clock = new THREE.Clock;

/**
 * Initializing orbit controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

function tick() {
    console.log("tick");
    const elapsedTime = clock.getElapsedTime()*.5;

    controls.update();
    
    doughnhuts.forEach((doughnut) => {
        doughnut.rotation.x = elapsedTime ;
        doughnut.rotation.y = elapsedTime * .9;
    });

    textMesh.position.x = Math.sin(elapsedTime);
    textMesh.position.y = Math.cos(elapsedTime);

/*     sphere.rotation.x = elapsedTime * .5;
    sphere.rotation.y = elapsedTime * .3;
    plane.rotation.x = elapsedTime * .5;
    plane.rotation.y = elapsedTime * .3;
    torus.rotation.x = elapsedTime * .5;
    torus.rotation.y = elapsedTime * .3; */
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
