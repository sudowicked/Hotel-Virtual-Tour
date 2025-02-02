let touchStartY = 0; // Store the initial touch position
let swipeCounter = 0; // Tracks how many times the user swiped
export let isScrolling = false;
let scrollTimeout = null;
let lastScrollTime = 0;
let isTouchpad = false; // Detects touchpad usage

export function handleScroll(event, positionAlongPathState) {
    event.preventDefault(); // Prevent browser scrolling (stops pull-to-refresh)

    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTime;
    lastScrollTime = now; // Update last scroll timestamp

    // **Detect touchpad vs mouse**
    if (event.type === "wheel") {
        isTouchpad = Math.abs(event.deltaY) < 30; // Small delta indicates touchpad
    }

    // **Increase swipeCounter only if there was a pause between gestures**
    if (timeSinceLastScroll > 100) {  
        swipeCounter = Math.min(swipeCounter + 1, 25); // Count only new swipes
        console.log("Swipe count:", swipeCounter);
    }

    // Clear timeout if still scrolling
    clearTimeout(scrollTimeout);

    positionAlongPathState.lastScrollTime = now;
    positionAlongPathState.startingDistance = positionAlongPathState.currentDistanceOnPath;

    let changeInScroll = 0;
    let speedMultiplier = swipeCounter * .5; // Base speed increase

    // Handle **mouse wheel & touchpad**
    if (event.type === "wheel") {
        changeInScroll = -Math.sign(event.deltaY);
    } 
    // Handle **touch swipes**
    else if (event.type === "touchmove") {
        const touchEndY = event.touches[0].clientY;
        const swipeDistance = touchStartY - touchEndY;

        if (Math.abs(swipeDistance) > 10) { // Ignore small movements
            changeInScroll = Math.sign(swipeDistance);
        }

        speedMultiplier *= 4;
    }

    // Apply movement to target distance
    positionAlongPathState.targetDistance += (changeInScroll * speedMultiplier) / positionAlongPathState.lengthToScroll;
    positionAlongPathState.velocity = 0;

    // **Detect end of scrolling and reset swipeCounter only after a pause**
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        swipeCounter = 0;
    }, 50); 
}

export function handleScrollEnd() {
    isScrolling = false; // Reset scrolling state
}

// Capture the initial touch position when the touch starts
export function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

// **Ensure swipeCounter increases only when the user lifts their finger**
export function handleTouchEnd() {
    swipeCounter = Math.min(swipeCounter + 1, 25);
    console.log("Swipe count increased:", swipeCounter);
}
    

// Update the position of the object (camera) along the curve path
export function updatePosition(curvePath, object, positionAlongPathState) {

    // Smoothing parameters
    const smoothingFactor = 0.05;
    const stopThreshold = 0.00001;

    // Calculate the distance to the target
    let distanceToTarget = positionAlongPathState.targetDistance - positionAlongPathState.currentDistanceOnPath;

    // Correct for wrapping around the path
    if (distanceToTarget > 0.5) {
        distanceToTarget -= 1;
    } else if (distanceToTarget < -0.5) {
        distanceToTarget += 1;
    }

    // Smoothly interpolate towards the target
    if (Math.abs(distanceToTarget) > stopThreshold) {
        positionAlongPathState.currentDistanceOnPath += distanceToTarget * smoothingFactor;
    } else {
        positionAlongPathState.currentDistanceOnPath = positionAlongPathState.targetDistance;
    }

    // Wrap position into a percentage along the path
    positionAlongPathState.currentPercentageOnPath =
        (positionAlongPathState.currentDistanceOnPath % 1 + 1) % 1;

    let lookAtPosition = positionAlongPathState.currentPercentageOnPath - 0.001;
    lookAtPosition = (lookAtPosition % 1 + 1) % 1;

    const newPosition = curvePath.curve.getPointAt(positionAlongPathState.currentPercentageOnPath);
    const newLookAt = curvePath.curve.getPointAt(lookAtPosition);

    object.position.copy(newPosition);
    object.lookAt(newLookAt);
};

// Listen for scroll and touch events
document.addEventListener("wheel", handleScrollEnd);
document.addEventListener("touchend", handleScrollEnd);
document.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });
