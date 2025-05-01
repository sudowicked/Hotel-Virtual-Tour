import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export let model = null;
export let mixer = null;
export let doorOpenAction, fanSpinAction1, fanSpinAction2, doorHandleAction, montanaAction = null;

export const LoadGLTFByPath = (scene, startingModelPath) => {
    return new Promise((resolve, reject) => {
      // Create a loader
      const loader = new GLTFLoader();
  
      // Load the GLTF file
      loader.load(startingModelPath, (gltf) => {
        model = gltf.scene;
        scene.add(model);
        console.log(gltf);

        mixer = new THREE.AnimationMixer(model);
        doorOpenAction = mixer.clipAction(gltf.animations[0]);
        doorHandleAction = mixer.clipAction(gltf.animations[1]);
        doorOpenAction.setLoop(THREE.LoopOnce);
        doorOpenAction.clampWhenFinished = true;
        doorHandleAction.setLoop(THREE.LoopOnce);
        doorHandleAction.clampWhenFinished = true;


        fanSpinAction1 = mixer.clipAction(gltf.animations[2]);
        fanSpinAction1.timeScale = 1.2;
        fanSpinAction2 = mixer.clipAction(gltf.animations[3]);
        fanSpinAction2.timeScale = 1.5;

        montanaAction = mixer.clipAction(gltf.animations[4]);
        
        resolve();
      }, undefined, (error) => {
        reject(error);
      });
    });
};

export const getOBjectByName = (scene, name) => {

  let foundObject = null;

  scene.traverse((object) => {
    if (object.name === name && foundObject === null) {
      foundObject = object;
    }
  });

  return foundObject;
}
