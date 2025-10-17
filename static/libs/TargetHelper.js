let originalMaterials = new Map();

// Return the parent of the hit mesh by looping until the parent is found 
export function getRootGroup(object, targetObjects) {
  let obj = object;
  while (obj.parent && !targetObjects.includes(obj)) {
    obj = obj.parent;
  }
  return obj;
}

export function highlight(object) {
  object.traverse((child) => {
    if (child.isMesh && child.material) {
      // store original mesh material
      originalMaterials.set(child.name, child.material);
      // using .clone() so it doesn’t affect shared materials
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m) => m.clone());
        child.material.forEach((m) => {
            m.emissiveIntensity = 5;
        })
      }
      else {
        child.material = child.material.clone();
        child.material.emissiveIntensity = 5;
      }
       
    }
  });
}

export function clearHover(hoveredTarget) {
  if (!hoveredTarget) return;

  hoveredTarget.traverse((child) => {
    if (child.isMesh) {
      const original = originalMaterials.get(child.name);
      if (original) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
        child.material = original;
      }
    }
  });

  originalMaterials.clear();
  hoveredTarget = null;
  return hoveredTarget;
}