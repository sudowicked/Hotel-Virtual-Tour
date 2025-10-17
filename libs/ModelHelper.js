import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three'

export let model = null;
export let mixer = null;
// export let doorOpenAction, fanSpinAction1, fanSpinAction2, doorHandleAction = null;


const targetNames = ['Corfu', 'Chair', 'Table', 'Lamp'];
export const targetObjects = [];

export const LoadGLTFByPath = (scene, startingModelPath, loadingManager) => {
    return new Promise((resolve, reject) => {
      
      // Draco loader
      const dracoLoader = new DRACOLoader(loadingManager);
      dracoLoader.setDecoderPath("/draco/");

      // GLTF loader
      const gltfLoader = new GLTFLoader(loadingManager);
      gltfLoader.setDRACOLoader(dracoLoader);
      
  
      // Load the GLTF file
      gltfLoader.load(startingModelPath, (gltf) => {
      model = gltf.scene;
      scene.add(model);
      console.log(model.children[0].children);
      let foundObject = null;

      scene.traverse((object) => {
        for (const n of targetNames) {
          if (object.name === n) {
            targetObjects.push(object);
          }
        }
          
      });


        // mixer = new THREE.AnimationMixer(model);
        // doorOpenAction = mixer.clipAction(gltf.animations[0]);
        // doorHandleAction = mixer.clipAction(gltf.animations[1]);
        // doorOpenAction.setLoop(THREE.LoopOnce);
        // doorOpenAction.clampWhenFinished = true;
        // doorHandleAction.setLoop(THREE.LoopOnce);
        // doorHandleAction.clampWhenFinished = true;


        // fanSpinAction1 = mixer.clipAction(gltf.animations[2]);
        // fanSpinAction1.timeScale = 1.2;
        // fanSpinAction2 = mixer.clipAction(gltf.animations[3]);
        // fanSpinAction2.timeScale = 2;

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
