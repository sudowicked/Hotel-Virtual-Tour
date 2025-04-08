let touchStartY = 0; // Store the initial touch position
export let isScrolling = false;
let scrollTimeout = null;
let lastScrollTime = 0;
let consecutiveScrolls = 1;
let speedMultiplier = .5;
let swipeStartY = 0;
let swipeEndY = 0;
const input = document.querySelector('.section');

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
    speedMultiplier = consecutiveScrolls * .5; // Base speed increase

    isScrolling = true;

    // Handle **mouse wheel & touchpad**
    if (event.type === "wheel") {
        changeInScroll = -Math.sign(event.deltaY);
        if (Math.abs(event.wheelDeltaY) === 120) {
            // speedMultiplier *= 4;
            // console.log("Mouse", speedMultiplier);
        }
        else {
            speedMultiplier *=.5;
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
            speedMultiplier *= 2;
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
    

// Update the position of the object (camera) along the curve path
export function updatePosition(curvePath, object, positionAlongPathState) {

    // Smoothing parameters
    const smoothingFactor = 0.04;
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

    // console.log(positionAlongPathState.currentDistanceOnPath);

    let lookAtPosition = positionAlongPathState.currentPercentageOnPath - 0.001;
    lookAtPosition = (lookAtPosition % 1 + 1) % 1;

    const newPosition = curvePath.curve.getPointAt(positionAlongPathState.currentPercentageOnPath);
    const newLookAt = curvePath.curve.getPointAt(lookAtPosition);

    object.position.copy(newPosition);
    object.lookAt(newLookAt);
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
