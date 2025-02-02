import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let model = null;

export const LoadGLTFByPath = (scene, startingModelPath) => {
    return new Promise((resolve, reject) => {
      // Create a loader
      const loader = new GLTFLoader();
  
      // Load the GLTF file
      loader.load(startingModelPath, (gltf) => {
        model = gltf.scene;
        scene.add(model);
        
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
