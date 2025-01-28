export function handleScroll(event, positionAlongPathState) {
    positionAlongPathState.lastScrollTime = performance.now();

    // When a new scroll starts, set the starting distance to the current position.
    positionAlongPathState.startingDistance = positionAlongPathState.currentDistanceOnPath;

    const changeInScroll = -Math.sign(event.deltaY);

    positionAlongPathState.targetDistance += changeInScroll / positionAlongPathState.lengthToScroll;

    // Reset velocity to ensure smooth acceleration.
    positionAlongPathState.velocity = 0;
}

export function updatePosition(curvePath, object, positionAlongPathState) {
    const timeElapsed = performance.now() - positionAlongPathState.lastScrollTime;

    // Smoothing parameters
    const smoothingFactor = 0.03; // How quickly it eases out (lower = slower)
    const stopThreshold = 0.0001; // Threshold to stop jittering near target

    // Calculate the distance to the target position
    const distanceToTarget = positionAlongPathState.targetDistance - positionAlongPathState.currentDistanceOnPath;

    // Smoothly interpolate towards the target
    if (Math.abs(distanceToTarget) > stopThreshold) {
        positionAlongPathState.currentDistanceOnPath += distanceToTarget * smoothingFactor;
    } else {
        positionAlongPathState.currentDistanceOnPath = positionAlongPathState.targetDistance;
    }

    // Wrap the current position into a percentage along the path [0, 1]
    positionAlongPathState.currentPercentageOnPath =
        (positionAlongPathState.currentDistanceOnPath % 1 + 1) % 1;

    // Calculate lookAtPosition as a small forward offset
    let lookAtPosition = positionAlongPathState.currentPercentageOnPath - 0.0001;

    // Wrap lookAtPosition into the range [0, 1]
    lookAtPosition = (lookAtPosition % 1 + 1) % 1;

    // Get positions from the curve
    const newPosition = curvePath.curve.getPointAt(positionAlongPathState.currentPercentageOnPath);
    const newLookAt = curvePath.curve.getPointAt(lookAtPosition);

    // Update object position and orientation
    object.position.copy(newPosition);
    object.lookAt(newLookAt);
}
