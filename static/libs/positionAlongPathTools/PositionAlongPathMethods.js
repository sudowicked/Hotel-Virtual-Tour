import * as THREE from 'three';

let touchStartY = 0; // Store the initial touch position
export let isScrolling = false;
let scrollTimeout = null;
let lastScrollTime = 0;
let consecutiveScrolls = 1;
let speedMultiplier = 5;
let swipeStartY = 0;
let swipeEndY = 0;

export function handleScroll(event, positionAlongPathState) {
    event.preventDefault(); // Prevent browser scrolling (stops pull-to-refresh)

    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTime;
    lastScrollTime = now; // Update last scroll timestamp


    // **Increase swipeCounter only if there was a pause between gestures**
    if (timeSinceLastScroll > 100 && timeSinceLastScroll < 600) { 
        // console.log(timeSinceLastScroll);
        consecutiveScrolls = Math.min(consecutiveScrolls + .8, 5);
        // console.log(consecutiveScrolls)
        
    }

    // Clear timeout if still scrolling
    clearTimeout(scrollTimeout);

    positionAlongPathState.lastScrollTime = now;
    positionAlongPathState.startingDistance = positionAlongPathState.currentDistanceOnPath;

    let changeInScroll = 0;
    speedMultiplier = consecutiveScrolls * .4; // Base speed increase

    isScrolling = true;

    // Handle **mouse wheel & touchpad**
    if (event.type === "wheel") {
        changeInScroll = -Math.sign(event.deltaY);
        if (Math.abs(event.wheelDeltaY) === 120) {
            // speedMultiplier *= 4;
            // console.log("Mouse", speedMultiplier);
        }
        else {
            speedMultiplier *=2;
            // console.log("Trackpad", speedMultiplier);
            // input.innerHTML = speedMultiplier;
        }
    } 
    // Handle **touch swipes**
    else if (event.type === "touchmove") {
        const touchEndY = event.touches[0].clientY;
        const swipeDistance = touchStartY - touchEndY;

        if (Math.abs(swipeDistance) > 10) { // Ignore small movements
            if (swipeEndY < swipeStartY) {
                changeInScroll = Math.sign(swipeDistance);
            }
            if (swipeEndY > swipeStartY)  {
                changeInScroll = -Math.sign(swipeDistance);
            } // Detect direction of touch swipe (up/down) and move camera accordingly 
            speedMultiplier *= 5;
            // input.innerHTML = speedMultiplier;
        };
    };

    // Apply movement to target distance
    positionAlongPathState.targetDistance += (changeInScroll * speedMultiplier) / positionAlongPathState.lengthToScroll;
    positionAlongPathState.velocity = 0;

    // **Detect end of scrolling and reset swipeCounter only after a pause**
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        consecutiveScrolls = 1;
    }, 600); 
};


export function handleScrollEnd() {
    isScrolling = false; // Reset scrolling state
    swipeStartY = swipeEndY; // Reset so next movement is independent
    // console.log('scroll end')
};

// Capture the initial touch position when the touch starts
export function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
};

// TODO z**Ensure swipeCounter increases only when the user lifts their finger**
export function handleTouchEnd() {
};

const targetElement = document.querySelector(".targetPoint");
const container = document.querySelector(".fullscreen-container");
    
// for (let i = 1; i < 4; i++) {
//     const clone = targetElement.cloneNode(true);
//     clone.classList.add(`point-${i}`);

//     container.appendChild(clone);
// }

const rotationTargets = [
    {
        position: new THREE.Vector3(52.38, 16.27, 8.55),
        start: 0.15,
        end: 0.3
    },
    {
        position: new THREE.Vector3(0.17, 14.2, -29.96),
        start: 0.4,
        end: 0.5 
    },
    {
        position: new THREE.Vector3(-46.50, 8.6, 11.91),
        start: 0.6,
        end: 0.7    
    },
    {
        position: new THREE.Vector3(-30.24, 6.0, 44.7),
        start: 0.8,
        end: 0.9 
    }
]



// Custom function
function getTargetIndex(splineProgress) {
    const fade = .05;
    for (let i = 0; i < rotationTargets.length; i++) {
        const focusedTarget = rotationTargets[i];

        if (splineProgress < focusedTarget.start + fade) {
            // return the id of the upcoming rotation target
            return i;
        }

        if (splineProgress >= focusedTarget.start && splineProgress <= focusedTarget.end + fade) {
            // inside a target zone
            return i;
        }

    }

    // after the last target
    return 0;
}

// Custom function for locking the camera rotation on targets
function cameraRotation(splineProgress, pathLookAt, newPathPosition) {
    const fadeDistance = 0.05;
    let targetLookAt = pathLookAt.clone();

    // Compute a smooth fade in/out factor
    let lerpFactor = 0;

    
    const targetId = getTargetIndex(splineProgress);
    // console.log(targetId)

    const target = rotationTargets[targetId];

    // Fade IN before paintingStart
    if (splineProgress >= target.start - fadeDistance && splineProgress < target.start) {
        lerpFactor = THREE.MathUtils.smoothstep(
            splineProgress,
            target.start - fadeDistance,
            target.start
        );
    }
    // Fully active in the middle
    else if (splineProgress >= target.start && splineProgress <= target.end) {
        lerpFactor = 1.0;
    }
    // Fade OUT after paintingEnd
    else if (splineProgress > target.end && splineProgress <= target.end + fadeDistance) {
        lerpFactor = 1.0 - THREE.MathUtils.smoothstep(
            splineProgress,
            target.end,
            target.end + fadeDistance
        );
    }

    const pathDirection = new THREE.Vector3().subVectors(pathLookAt, newPathPosition).normalize();
    const targetDirection = new THREE.Vector3().subVectors(target.position, newPathPosition).normalize();
    const blendedDirection = new THREE.Vector3().lerpVectors(pathDirection, targetDirection, lerpFactor).normalize();
    
    targetLookAt = new THREE.Vector3().addVectors(newPathPosition, blendedDirection);


    return targetLookAt;
}

// Update the position of the object (camera) along the curve path
export function updatePosition(curvePath, object, positionAlongPathState) {

    // Smoothing parameters
    const smoothingFactor = 0.02;
    const stopThreshold = 0.00001;

    // Calculate the distance to the target
    const distanceToTarget = positionAlongPathState.targetDistance - positionAlongPathState.currentDistanceOnPath;
    //console.log(positionAlongPathState.targetDistance)

    // Smoothly interpolate movement towards the target
    if (Math.abs(distanceToTarget) > stopThreshold) {
        positionAlongPathState.currentDistanceOnPath += distanceToTarget * smoothingFactor;
    } else {
        positionAlongPathState.currentDistanceOnPath = positionAlongPathState.targetDistance;
    }

    // Wrap position into a percentage along the path
    positionAlongPathState.currentPercentageOnPath = (positionAlongPathState.currentDistanceOnPath % 1 + 1) % 1;

    let lookAtPosition = positionAlongPathState.currentPercentageOnPath - 0.001;
    lookAtPosition = (lookAtPosition % 1 + 1) % 1;

    // Create the Vec3 positions for the camera movement and rotation
    const newPathPosition = curvePath.curve.getPointAt(positionAlongPathState.currentPercentageOnPath);
    const pathLookAt = curvePath.curve.getPointAt(lookAtPosition);

    // Calculate the position % of the camera along the spline
    const splineProgress = -(positionAlongPathState.currentDistanceOnPath % 1);
    // console.log(splineProgress)

    const targetLookAt = cameraRotation(splineProgress, pathLookAt, newPathPosition);
    
    object.position.copy(newPathPosition);
    object.lookAt(targetLookAt);



};

// Listen for scroll and touch events
document.addEventListener("wheel", handleScrollEnd);
document.addEventListener('touchstart', e => {
    swipeStartY = e.changedTouches[0].screenY;
});
document.addEventListener("touchend", e => {
    swipeEndY = e.changedTouches[0].screenY;
    handleScrollEnd();
});
// document.addEventListener("touchmove", (event) => {
//     event.preventDefault();
// }, { passive: false });
