class Farmer extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, texture, frame, direction) {
        super(scene, path, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //way to record the direction the farmer is facing
        this.direction = direction;
    }
}
//inherits from State; Acts as an abstract class to define properties and methods common among all child classes
class FarmerState extends State {
    constructor(scene, farmer) {
        //subclass constructors require that you call the super constructor:
        //https://stackoverflow.com/questions/31067368/how-to-extend-a-class-without-having-to-use-super-in-es6
        super();
        //graphics for testing the AI and seeing the paths it follows
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xFFFFFF, 0.75);
        //crude way to check direction farmer is moving by comparing it's last position
        this.oldX = farmer.x;
        this.oldY = farmer.y;
        //checker for updating the direction when it changes instead of constantly
        this.oldDirection = farmer.direction;

        // create the pathConfig defining details for the farmer following paths
        // note: you can mix properties from both types of config objects
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Tweens.html#.NumberTweenBuilderConfig
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.PathFollower.html#.PathConfig
        this.pathConfig = {
            startAt: 0,
            from: 0,            // points allow a path are values 0–1
            to: 1,
            delay: 0,
            duration: 5000,
            // important that the ease is linear to make the farmer move at a constant velocity
            ease: 'Power0',     
            hold: 0,
            repeat: 0,
            yoyo: false,
            rotateToPath: false
        };
    }

    enter(scene, farmer) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.enter(scene, farmer, ...args); to use the common behaviors
    }

    execute(scene, farmer) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.execute(scene, farmer, ...args); to use the common behaviors
    }

    //checks the path's length to determine how fast the farmer should complete the path
    //include a factor given by each state to allow for different speeds depending on intended behavoir
    //(i.e. chasing turnip is faster, walking around the garden is slower, etc.)
    updateSpeed(farmer, factor) {
        //console.log("dist     " + farmer.path.getLength());
        //if statements act as piecewise function for determining the speed factor
        if(farmer.path.getLength() <= 50) { //short path piecewise function
            //this.pathConfig.duration = ((farmer.path.getLength() / 1.5) * 50);
            this.pathConfig.duration = (farmer.path.getLength() * 5) / factor;
        } 
        else if(farmer.path.getLength() > 50 && farmer.path.getLength() <= 500) { //short path piecewise function
            //this.pathConfig.duration = (1000000 / (farmer.path.getLength()));
            this.pathConfig.duration = (farmer.path.getLength() * 10) / factor;
        }
        else {
            //this.pathConfig.duration = ((farmer.path.getLength() / 3) * 50);
            this.pathConfig.duration = (farmer.path.getLength() * 10) / factor;
        }
        //console.log("duration " + this.pathConfig.duration);
    }

    //crude way to determine the direction of the farmer by comparing it's old position to its current
    findDirection(farmer) {
        let newX = farmer.x;
        let newY = farmer.y;

        let defaultAngle = Math.round(-1 * Math.atan2(newY - this.oldY, newX - this.oldX) * (180 / Math.PI));
        let angle = defaultAngle;
        if (angle < 0)
            angle += 360;
        if (angle <= 45 || angle > 315)
            farmer.direction = 'right';
        else if (angle <= 135 && angle > 45)
            farmer.direction = 'up';
        else if (angle <= 225 && angle > 135)
            farmer.direction = 'left';
        else if (angle <= 315 && angle > 225)
            farmer.direction = 'down';

        this.oldX = newX;
        this.oldY = newY;

        return Math.round(defaultAngle);
    }

    //used to force the farmer to face turnip in situations where he logically should
    //(e.g. farmer chasing turnip and turnip step out of line of sight but is still within range)
    faceTurnip(farmer, turnip) {
        let angle = Math.round(-1 * Math.atan2(turnip.y - farmer.y, turnip.x - farmer.x) * (180 / Math.PI));
        if (angle < 0)
            angle += 360;
        if (angle <= 45 || angle > 315)
            farmer.direction = 'right';
        else if (angle <= 135 && angle > 45)
            farmer.direction = 'up';
        else if (angle <= 225 && angle > 135)
            farmer.direction = 'left';
        else if (angle <= 315 && angle > 225)
            farmer.direction = 'down';
    }

    updateDirection(farmer) {
        if (this.oldDirection != farmer.direction) {
            this.oldDirection = farmer.direction;
            if(farmer.isFollowing()) {
                farmer.play(`farmer-${farmer.direction}`);
            }
            //TODO: set the farmer's image to the corresponding direction
            return true;
        }
        return false;
    }

    //checks anything that would alert the farmer 
    //(i.e. farmer within range of turnip and sees turnip or farmer hears noise)
            //turnip causes noise by: 
    //stealing crops, running through crops, jumping in holes, running close enough to farmer
    checkAlerts(scene, farmer, turnip, noise) {
        let farmerAngle;
        //if the farmer is not moving, check if they can see turnip from their current direction
        if (!farmer.isFollowing()) {
            switch (farmer.direction) {
                case 'up':
                    farmerAngle = 90;
                    break;
                case 'down':
                    farmerAngle = -90;
                    break;
                case 'left':
                    farmerAngle = 180;
                    break;
                case 'right':
                    farmerAngle = 0;
                    break;
                default:
                    console.warn(`found direction: ${farmer.direction} not listed`);
                    break;
            }
        }
        else //otherwise we need to find the new direction 
            farmerAngle = this.findDirection(farmer);
        this.updateDirection(farmer);
        let farmerToTurnipAngle = Math.round(-1 * Math.atan2(turnip.y - farmer.y, turnip.x - farmer.x) * (180 / Math.PI));
        //calculate the differnce in degrees that the farmer is facing from turnip
        let facing = Math.round(Math.abs(Math.abs(farmerAngle) - Math.abs(farmerToTurnipAngle)));
        let distance = Phaser.Math.Distance.Between(farmer.x, farmer.y, turnip.x, turnip.y);
        //if the farmer is facing within 45 degrees of turnip and they are close enough, they see turnip
        if (facing < 45 && distance < 200){
            return "sees turnip";
        }
        
        //otherwise, see if the farmer heard something
        //noise is passed as an array which is from the turnipFSM using getInfo() //see play.js update()
        if(noise[0] != "none") {
            switch(noise[0]){
                case "running": //if turnip is running within a dist from farmer, then they hear turnip
                    if (distance < 100)
                        return "hears turnip";
                    break;
                case "running over crops": //etc.
                    if (distance < 200)
                        return "hears turnip";
                    break;
                case "stealing":
                    if (distance < 350)
                        return "hears turnip";
                    break;
                case "burrowing":
                    if (distance < 350)
                        return "hears turnip";
                    break;
                default:
                    console.warn(`noise: ${noise[0]} not recognized`);
                    break;
            }
        }
        return "none";
    }
}

//implementation for all the different FSM states for farmer

//stop moving, look for turnip in the direction of noise or if in line of sight
class SearchState extends FarmerState {
    constructor(scene, farmer) { 
        super(scene, farmer); 
        //create empty bindings to be used later in any of the class methods
        this.path;
        this.delay;
        this.lookingAround = false;
    }

    enter(scene, farmer, audios, turnip, timeDelay, skipEnter) {
        farmer.stopFollow();
        farmer.anims.stop();
        this.lookingAround = false;
        if(skipEnter)
            return;

        let locationX = turnip.x;
        let locationY = turnip.y;
        //TODO: fiona put question sound here
        let question = scene.add.sprite(farmer.x, farmer.y - (farmer.displayHeight / 1.5), 'question');
        question.anims.play('question anim');
        question.on('animationcomplete', () => {
            question.destroy();
        });
        //check if we have a specific delay before farmer goes to location of the noise
        this.delay = (timeDelay !== undefined) ? timeDelay : 2000;
        scene.time.delayedCall(this.delay, () => {
            //general path following set up in 3 steps:
            //(1): create the path
            this.path = scene.add.path(farmer.x, farmer.y);
            this.path.lineTo(locationX, locationY);
            //(2): set follower to said path
            farmer.setPath(this.path);
            //this.path.draw(this.graphics);
            //TODO: check for obstacles in the way and create a path around them
            //(2.5): optional: edit an optional follow config to specify path follow behavior 
            this.updateSpeed(farmer, 1.2);
            //(3): have the follower start following the path.
            farmer.startFollow(this.pathConfig);
        }, null, this);

        //play the stop (reset farmer to be a static idle image instead of an animation) 
        //farmer.anims.play(`walk-${farmer.direction}`);
        //farmer.anims.stop(); 
    }

    execute(scene, farmer, audio, turnip, noise) {
        let alert = super.checkAlerts(scene, farmer, turnip, noise);
        if (alert != "none") {
            scene.time.removeAllEvents();
            if (alert == "sees turnip"){
                this.stateMachine.transition("chase");
                return;
            }
            else if (alert == "hears turnip") {
                //each time farmer hears something while searching, follow the noise quicker
                if (this.delay >= 500) {
                    this.delay /= 2; 
                }
                this.stateMachine.transition("search", this.delay);
                return;
            }
            else
                console.warn(`alert ${alert} unknown`);
        }
        if (!farmer.isFollowing()) {
            //after walking to the area of noise, look around and then transition to find path
            if(!this.lookingAround) {
               this.lookingAround = true;
            let turnOrder = [];
            switch (farmer.direction) {
                case "up":
                    turnOrder = ["down", "left", "right"];
                    break;
                case "down":
                    turnOrder = ["up", "right", "left"];
                    break;
                case "left":
                    turnOrder = ["right", "up", "down"];
                    break;
                case "right":
                    turnOrder = ["left", "down", "up"];
                    break;
                default:
                    console.warn(`farmer direction: ${farmer.direction} unknown`);
                    return;
            }
            scene.time.delayedCall(1000, () => {
                farmer.direction = turnOrder[0];
                farmer.play(`farmer-${farmer.direction}`);
                farmer.anims.stop();
                //TODO: update farmer image to corresponding direction
            }, null, this);
            scene.time.delayedCall(2000, () => {
                farmer.direction = turnOrder[1];
                farmer.play(`farmer-${farmer.direction}`);
                farmer.anims.stop();
                //TODO: update farmer image to corresponding direction
            }, null, this);
            scene.time.delayedCall(3000, () => {
                farmer.direction = turnOrder[2];
                farmer.play(`farmer-${farmer.direction}`);
                farmer.anims.stop();
                //TODO: update farmer image to corresponding direction
            }, null, this);
            scene.time.delayedCall(4000, () => {
                if (!farmer.isFollowing()) {
                    this.lookingAround = false;
                    scene.time.removeAllEvents();
                    this.stateMachine.transition("findPath");
                    return;
                }
            }, null, this);
           }
        }
    }
}

//follow direct path between farmer and turnip
//if turnip goes out of view, stop at the last place seen and search
class ChaseState extends FarmerState {
    constructor(scene, farmer, stats) { 
        super(scene, farmer);
        this.stats = stats;
    }

    enter(scene, farmer, audios, turnip, timeDelay) {
        farmer.stopFollow();
        farmer.anims.stop();
        let locationX = turnip.x;
        let locationY = turnip.y;
        //TODO: fiona put exclamation sound here
        let warning = scene.add.sprite(farmer.x, farmer.y - (farmer.displayHeight / 1.5), 'warning', 0);
        warning.anims.play('warning anim');
        warning.on('animationcomplete', () => {
            warning.destroy();
        });
        let delay = (timeDelay !== undefined) ? timeDelay : 500;
        scene.time.delayedCall(delay, () => {
            this.path = scene.add.path(farmer.x, farmer.y)
            this.path.lineTo(locationX, locationY);
            farmer.setPath(this.path);
            //this.path.draw(this.graphics);
            //TODO: check for obstacles in the way and create a path around them
            this.updateSpeed(farmer, 1.7);
            //console.log(this.pathConfig.duration);
            farmer.startFollow(this.pathConfig);
        }, null, this);
    }
    execute(scene, farmer, audio, turnip, noise) {
        //outside of alert checking because 
        //if we're in the chase state and turnip burrows, we should bury the hole.
        if (noise[0] == "burrowing") {
            scene.time.removeAllEvents();
            this.stateMachine.transition("bury", noise[1]); 
            //noise[1] is obj: location: x,y; (hole tile pos) and the shop UI sprite for the hole 
            return;
        }
        let alert = super.checkAlerts(scene, farmer, turnip, noise);
        if (alert != "none") {
            if (alert == "sees turnip") {
                // //if the farmer needs to follow a new path towards turnip,
                // //update the current path
                // if(farmer.path.getEndPoint().x != turnip.x
                // || farmer.path.getEndPoint().y != turnip.y) {
                //     this.path.moveTo(turnip.x, turnip.y);
                //     this.path.draw(this.graphics);
                if (!farmer.isFollowing()) {
                    //if the farmer sees turnip and finished following to his last location
                    //keep chasing him
                    scene.time.delayedCall(100, () => {
                        if (!farmer.isFollowing()) {
                            scene.time.removeAllEvents();
                            this.stateMachine.transition("chase", 1);
                            return;
                        }
                    }, null, this);
                }
            }
            else if (alert == "hears turnip") {
                super.faceTurnip(farmer, turnip);
                if (!farmer.isFollowing()) {
                    //if the farmer hears turnip and finished following to his last location
                    //keep chasing him with shorter delay
                    scene.time.delayedCall(100, () => {
                        if (!farmer.isFollowing()) {
                            scene.time.removeAllEvents();
                            this.stateMachine.transition("chase", 500);
                            return;
                        }
                    }, null, this);
                }
            }
        }
        if (!farmer.isFollowing()) {
            //after a little bit of not finding anything, go back to the normal walking routes
            scene.time.delayedCall(500, () => {
                if (!farmer.isFollowing()) {
                    scene.time.removeAllEvents();
                    //reuse the looking around part of search
                    this.stats.escaped++;
                    this.stateMachine.transition("search", undefined, true); 
                    return;
                }
            }, null, this);
        }

        // handle animation
        //farmer.anims.play(`walk-${farmer.direction}`, true);
    }
    exit(scene, farmer, audios) {
    }
}

//go to hole tile and bury it.
class BuryState extends FarmerState {
    constructor(scene, farmer, field) { 
        super(scene, farmer);
        this.tileInfo; 
        this.path;
        this.field = field;
    }

    enter(scene, farmer, audios, path, tileInfo) {
        farmer.stopFollow();
        farmer.anims.stop();
        //console.log(tileInfo);
        this.tileInfo = tileInfo;
        let locationX = this.field.tileToWorldX(this.tileInfo.location.x);
        let locationY = this.field.tileToWorldY(this.tileInfo.location.y);
        //TODO: create an angry emoji above farmer's head
        this.path = scene.add.path(farmer.x, farmer.y)
        this.path.lineTo(locationX, locationY);
        farmer.setPath(this.path);
        //this.path.draw(this.graphics);
        //TODO: check for obstacles in the way and create a path around them
        this.updateSpeed(farmer, 1);
        //console.log(this.pathConfig.duration);
        farmer.startFollow(this.pathConfig);
    }

    execute(scene, farmer, audio, turnip, noise) {
        //on path complete
        //replace hole tile with buried hole tile
        //somehow remove the hole tile from usable holes
        //transition to search state
        if (!farmer.isFollowing()) {
            //after a little bit of not finding anything, go back to the normal walking routes
            scene.time.delayedCall(100, () => {
                if (!farmer.isFollowing()) {
                    //TODO: play burying animation
                    //TODO: on animation complete
                    this.field.putTileAt(9, this.tileInfo.location.x, this.tileInfo.location.y, false);
                    this.tileInfo.sprite.setTexture('covered hole');
                    this.tileInfo.sprite.covered = true;
                    scene.time.removeAllEvents();
                    this.stateMachine.transition("findPath"); 
                    return;
                }
            }, null, this);
        }
    }
}

//select a random plant to water
//TODO: see if you can fit this logic in walk state instead of creating its own state
//TODO: see if the farmer should be altered in this state or not 
//(could be a mechanic to allow the player move close by the farmer while they're busy watering)
class WaterState extends FarmerState {
    constructor(scene, farmer) { super(scene, farmer); }

    enter(scene, farmer, audios) {
        //play a watering animation
    }

    execute(scene, farmer, audio, turnip, noise) {
        //on animation complete
        //transition back to walk state (given the current path)
    }
}

class pathState extends FarmerState {
    constructor(scene, farmer, map) {
        super(scene, farmer);
        this.paths = []; //array of different paths
        this.createPaths(scene, map);
    }

    createPaths(scene, map) {
        //create all paths from paths object layer in the tilemap
        for (let i = 1; ; i++) {
            //find each path start
            let pathStart = map.findObject("paths", obj => obj.name === ("p" + i + "start"));
            if (pathStart != null) { //if the path point was found
                //add it to the path object
                let path = scene.add.path(pathStart.x, pathStart.y);
                for (let j = 1; ; j++) {
                    //for every point on that path, add a line to each point in order
                    let pathPoint = map.findObject("paths", obj => obj.name === ("p" + i + "point" + j));
                    if (pathPoint != null) //if the next path point was found
                        path.lineTo(pathPoint.x, pathPoint.y);
                    else
                        break;
                }
                //path.draw(this.graphics);
                //enter the path into the paths array
                this.paths.push(path);
                //copy the reverse of the path (creates bidirectional pathing for farmer's passive walking routes)
                let reverseArray = path.getPoints().reverse();
                // reverseArray.reverse();
                let reversePath = null;
                for (let point of reverseArray) {
                    if (reversePath == null)
                        reversePath = scene.add.path(reverseArray[0].x, reverseArray[0].y);
                    else
                        reversePath.lineTo(point.x, point.y);
                }
                this.paths.push(reversePath);
            }
            else
                break; //couldn't find another path to create
        }

        //for let loop uses destructuring to get both the element and index of the array
        //https://flaviocopes.com/how-to-get-index-in-for-of-loop/
        for (let [index, path] of this.paths.entries()) {
            path.name = "p" + index; //give each path a name to check in pathfinding
        }
    }
}

//finds the closest path near the farmer
//and has the farmer return to the start of that path again
class findPathState extends pathState {
    constructor(scene, farmer, map) {
        super(scene, farmer, map);
        this.closestPath = null;
    }
    enter(scene, farmer, audios, turnip) {
        let minDist = 100000000;
        for(let path of this.paths) {
            let pathStart = path.getStartPoint();
            let distance = Phaser.Math.Distance.Between(farmer.x, farmer.y, pathStart.x, pathStart.y);
            if(distance < minDist) {
                minDist = distance;
                this.closestPath = path;
            }
        }
        let tempPath = scene.add.path(farmer.x,farmer.y);
        tempPath.lineTo(this.closestPath.getStartPoint().x, this.closestPath.getStartPoint().y);
        farmer.setPath(tempPath);
        this.updateSpeed(farmer, 1.1);
        //console.log(this.pathConfig.duration);
        farmer.startFollow(this.pathConfig);
    }
    execute(scene, farmer, audios, turnip, noise) {
        let alert = super.checkAlerts(scene, farmer, turnip, noise);
        if (alert != "none") {
            scene.time.removeAllEvents();
            if (alert == "sees turnip"){
                this.stateMachine.transition("chase");
                return;
            }
            else if (alert == "hears turnip"){
                this.stateMachine.transition("search");
                return;
            }
            else
                console.warn(`alert ${alert} unknown`);
        }
        if (!farmer.isFollowing()) {
            //used a delayed call because of update issue calling this before enter method completes
            scene.time.delayedCall(1000, () => {
                if (!farmer.isFollowing()) {
                    scene.time.removeAllEvents();
                    this.stateMachine.transition("walk", this.closestPath.name);
                    return;
                }
            }, null, this);
        }
    }
}

//walk around the farm
//chooses a random path in subset of paths to follow
//on path complete, follows a different random path
class WalkState extends pathState {
    constructor(scene, farmer, map) {
        super(scene, farmer, map);
        farmer.setPath(this.paths[0]);
        let startPoint = this.paths[0].getStartPoint();
        farmer.setPosition(startPoint.x, startPoint.y);
    }

    enter(scene, farmer, audios, turnip, pathName, wateredPlant) {
        //if(wateredPlant) //if we just watered a plant
        //continue following the given path
        //else
        //choose random path (excluding the given path)
        //follow path
        if (!(pathName === undefined)) {
            //create an array of the possible paths for the farmer to follow given it's starting point
            let possiblePaths = [];
            for (let path of this.paths) {
                //rounding so it actually finds starting points for the correct paths
                if (Math.round(path.startPoint.x) == Math.round(farmer.x)
                    && Math.round(path.startPoint.y) == Math.round(farmer.y))
                    possiblePaths.push(path);
            }

            //choose random path from the possible paths (excluding the given path)
            let randomIndex = Phaser.Math.Between(0, possiblePaths.length - 1); //random integer inclusive

            //find the path the farmer just took
            let previousPath = null;
            for (let path of this.paths) {
                if (path.name == pathName) {
                    previousPath = path;
                    break;
                }
            }
            if (previousPath == null) {
                console.warn(`couldn't find path given path name: ${pathName}`);
            }
            else {
                //if they are going to follow the same path they just took, change it to a different one.
                if (Math.round(previousPath.startPoint.x) == Math.round(possiblePaths[randomIndex].getEndPoint().x)
                    && Math.round(previousPath.startPoint.y) == Math.round(possiblePaths[randomIndex].getEndPoint().y)) {
                    //increment randomIndex to get a different random path
                    randomIndex = (randomIndex == possiblePaths.length - 1) ? 0 : (randomIndex + 1);
                }
            }

            //follow that path
            farmer.setPath(possiblePaths[randomIndex]);
            //TODO: see if you still need to set farmer position to the start position
            //(might be helpful so small rounding errors don't add up over time)
            let startPoint = possiblePaths[randomIndex].getStartPoint();
            farmer.setPosition(startPoint.x, startPoint.y);
        }
        this.updateSpeed(farmer, 1.1);
        farmer.startFollow(this.pathConfig);
    }

    execute(scene, farmer, audios, turnip, noise) {
        //if(super.checkAlerts()) //if the farmer has been altered in some manner
        //transition to search state
        //if farmer is on top of a crop
        //calculate 25% chance
        //if success, transition to water state (pass it the current path)
        //on path complete
        //transition to walk state again (passing the current path) (AKA: finds a new path)
        
        let alert = super.checkAlerts(scene, farmer, turnip, noise);
        if (alert != "none") {
            scene.time.removeAllEvents();
            if (alert == "sees turnip"){
                this.stateMachine.transition("chase");
                return;
            }
            else if (alert == "hears turnip"){
                this.stateMachine.transition("search");
                return;
            }
            else
                console.warn(`alert ${alert} unknown`);
        }
        if (!farmer.isFollowing()) {
            //used a delayed call because of update issue calling this before enter method completes
            scene.time.delayedCall(100, () => {
                if (!farmer.isFollowing()) {
                    scene.time.removeAllEvents();
                    this.stateMachine.transition("walk", farmer.path.name);
                    return;
                }
            }, null, this);
        }
    }
}