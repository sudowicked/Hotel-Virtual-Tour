class PositionAlongPathState {
    constructor() {
        this.startingDistance = 0.000001;
        this.currentDistanceOnPath = 0.000001;
        this.currentPercentageOnPath = 0.000001;
        this.targetDistance = 0;
        this.movementDuration = 100; // how long it should take 
        this.lengthToScroll = 250; //How many scroll ticks are required to complete the loop. 
        this.lastScrollTime = 0;
        this.velocity = 0;
    }
}

export default PositionAlongPathState;