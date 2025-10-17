import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { LoadGLTFByPath, targetObjects} from '../static/libs/ModelHelper';
import { gsap } from 'gsap/gsap-core';
import { loadCurveFromJSON} from '../static/libs/CurveMethods'
import PositionAlongPathState from '../static/libs/positionAlongPathTools/PositionAlongPathState';
import { handleScroll, updatePosition, isScrolling} from '../static/libs/positionAlongPathTools/PositionAlongPathMethods';
import * as dat from 'lil-gui';
import { setupRenderer } from '../static/libs/RendererHelper';
import {getRootGroup, highlight, clearHover} from '../static/libs/TargetHelper';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';
import { getParticleSystem } from '../static/libs/getParticleSystem';

// Scene
const scene = new THREE.Scene();

// Paths
const hotelPath = './meshes/lobby/Lobby_Compressed.glb'
const curvePathJSON = './meshes/lobby/Lobby.json'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Renderer
const canvas = document.querySelector('.webgl');
const container = document.querySelector('.fullscreen-container');
const renderer = setupRenderer();   


/**
 * MAIN CODE
 */

//LOADING MANAGER
const loadingScreenElement = document.querySelector(".loading-screen");
loadingScreenElement.classList.add("active"); // trigger animation
const percentageElement = document.querySelector(".progress-percentage");
percentageElement.classList.add("active");

const hotelLogo = document.querySelector(".logo");

let currentProgress = 0;  
let targetProgress = 0; 

function animateProgress() {
    currentProgress += (targetProgress - currentProgress) * 0.1;
    percentageElement.textContent = `${Math.floor(currentProgress)}`;

    if(currentProgress <= 100) {
        requestAnimationFrame(animateProgress)
    }
}

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        targetProgress = 101; 
        window.setTimeout(() =>
        {
            console.log('loaded');
            loadingScreenElement.classList.add("inactive");
            percentageElement.classList.remove("active");
            percentageElement.classList.add("inactive");

            // Making hotel logo visible once everything is loaded
            hotelLogo.classList.add("active");
            // gsap.to(loadingMaterial.uniforms.uAlpha, { duration: 3, value: 0});
        }
        , 1500) 
        
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        targetProgress = (itemsLoaded / itemsTotal) * 100;

        // start animation loop if not running
        if (currentProgress === 0) {
            percentageElement.classList.add("active");
            requestAnimationFrame(animateProgress);
        }
        // console.log(itemsLoaded);
    }
);

// Meshes       
await LoadGLTFByPath(scene, hotelPath, loadingManager);

let curvePath = await loadCurveFromJSON(curvePathJSON);
// scene.add(curvePath.mesh);


// CameraList
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 1000);
camera.position.copy(curvePath.curve.getPointAt(0));
camera.lookAt(curvePath.curve.getPointAt(0.99));
scene.add(camera);

// TV video element
// let video = document.getElementById('video');
// let videoTexture = new THREE.VideoTexture(video);
// videoTexture.minFilter = THREE.LinearFilter;
// videoTexture.magFilter = THREE.LinearFilter;
// videoTexture.format = THREE.RGBFormat;

// const lcd = model.children[31];
// video.play();
// lcd.children[1].material = new THREE.MeshBasicMaterial({ map: videoTexture });


// PathState
let positionAlongPathState = new PositionAlongPathState();

window.addEventListener('wheel', (event) => {
    handleScroll(event, positionAlongPathState);
});

// window.addEventListener('touchstart', (event) => {
//     handleTouchStart(event);
// });

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


// Smoke particles
// const pipePosition = model.children[17].position;

// const smokeEffect = getParticleSystem({
//     camera,
//     emitter: new THREE.Vector3(pipePosition.x - .1, pipePosition.y + .36, pipePosition.z - .3),
//     parent: scene,
//     rate: 100,
//     texture: './textures/img/smoke.png',
// });

// Create skybox
function createPathStrings(filename, fileType) {
    const basePath = './textures/environmentMaps/interstellar';
    const sides = ['ft-min', 'bk-min', 'up-min', 'dn-min', 'rt-min', 'lf-min'];
    const pathStrings = sides.map(side => {
        return basePath + filename + "_" + side + fileType;
    });
    return pathStrings;
}

function createMaterialArray(filename, fileType) {
    const skyboxPaths = createPathStrings(filename, fileType);
    const arrayMaterial = skyboxPaths.map(image => {
        let texture = new THREE.TextureLoader(loadingManager).load(image);
        // console.log(image);
        return new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
    });
    return arrayMaterial;
}

const skyboxImage = '/interstellar';
const skyboxFileType = '.png';

const skyboxMaterial = createMaterialArray(skyboxImage, skyboxFileType);
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000, 100, 100, 100);
const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skyboxMesh);

// Raycaster for hovering target objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredTarget = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster init
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(targetObjects, true); // setting to true for recursive check for group meshes

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const target = getRootGroup(hit, targetObjects);

    if (hoveredTarget !== target) {
      clearHover(hoveredTarget);
      hoveredTarget = target;
      highlight(target);
      console.log('Hovered:', target.name);
    }
  } else {
    hoveredTarget = clearHover(hoveredTarget);
  }
}


window.addEventListener('pointermove', onPointerMove);
console.log(targetObjects)

// Target labels object
const targetLabels = [
    {
        position: new THREE.Vector3(52.38, 16.27, 8.55),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.17, 14.2, -29.96), 
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-46.50, 8.6, 11.91),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(-30.24, 6.0, 44.7),
        element: document.querySelector('.point-3')
    }
]



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
})

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
    // smokeEffect.update(0.026);
    // controls.update();

    // Get normalized t in [0, 1]
    let t = positionAlongPathState.currentDistanceOnPath % 1;
    if (t < 0) t += 1;

    // Move camera along path
    // const pointOnPath = curvePath.curve.getPointAt(t);
    // camera.position.copy(pointOnPath);


    // Track label to each target
    for (const t of targetLabels) {
        const screenPosition = t.position.clone();
        //screenPosition.project(object);

        const translateX = screenPosition.x * sizes.width * 0.5;
        const translateY = - screenPosition.y * sizes.height * 0.5;

        //t.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
 
    }

    // Animation update
    // if (mixer) mixer.update(deltaTime);

    // Get normalized splinePos in [0, 1]
    let splinePos = -(positionAlongPathState.currentDistanceOnPath % 1);
    if (splinePos < 0) splinePos += 1;

    // Door should be open between 0.28 and 0.9
    const inRoom = splinePos > 0.28 && splinePos < 0.9;

    // console.log(splinePos);



    // const parallaxX = mouse.x * .1;
    // const parallaxY = mouse.y * .1;

    // model.rotation.y += (parallaxX - model.rotation.y) * deltaTime;
    // model.rotation.z += (parallaxY - model.rotation.z) * deltaTime;



    // Get tangent to align the base direction
    // const tangent = curvePath.curve.getTangentAt(t).normalize();

    // // Y-axis up vector
    // const up = new THREE.Vector3(0, 1, 0);

    // // Create base rotation to align with tangent
    // const baseQuat = new THREE.Quaternion().setFromUnitVectors(
    //     new THREE.Vector3(0, 0, -1), // default forward
    //     tangent
    // );

    // // Update yaw/pitch with inertia
    // yaw += yawVelocity;
    // pitch += pitchVelocity;

    // yawVelocity *= damping;
    // pitchVelocity *= damping;

    // // Clamp pitch
    // const pitchLimit = Math.PI / 2 - 0.1;
    // pitch = THREE.MathUtils.clamp(pitch, -pitchLimit, pitchLimit);

    // // Build rotation around base forward direction
    // const tempObject = new THREE.Object3D();
    // tempObject.quaternion.copy(baseQuat);

    // // Apply yaw (around world Y)
    // tempObject.rotateOnWorldAxis(up, yaw);

    // // Apply pitch (around local X)
    // tempObject.rotateX(pitch);

    // // Set camera to look in that direction
    // const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(tempObject.quaternion);
    // cameraTarget.copy(camera.position).add(direction);
    // camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);


    // Skybox anim
    skyboxMesh.rotation.y += 0.00005;
};
tick();