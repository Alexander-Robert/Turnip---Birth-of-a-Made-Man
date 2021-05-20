class Farmer extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, texture, frame, direction) {
        super(scene, path, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //create individual properties for Farmer
        this.direction = direction;
        this.velocity = 200;
        //this.body.setCollideWorldBounds(true);
    }
}
//inherits from State; Acts as an abstract class to define properties and methods common among all subclasses
class FarmerState extends State {
    constructor(scene) {
        //subclass constructors require that you call the super constructor:
        //https://stackoverflow.com/questions/31067368/how-to-extend-a-class-without-having-to-use-super-in-es6
        super();
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xFFFFFF, 0.75);
    }

    enter(scene, farmer) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.enter(scene, farmer, ...args); to use the common behaviors
    }

    execute(scene, farmer) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.execute(scene, farmer, ...args); to use the common behaviors
    }

    //checks anything that would alert the farmer 
    //(i.e. farmer within range of turnip and sees turnip or farmer hears noise)
    //turnip causes noise by: stealing crops, running through crops, jumping in holes
    checkAlerts(scene, farmer, audio, turnip, noise) {

    }
}

//implementation for all the different FSM states for farmer

//stop moving, look for turnip in the direction of noise or if in line of sight
class SearchState extends FarmerState {
    constructor(scene) { super(scene); } //pass the scene into FarmerState to define the keys, methods, etc.

    enter(scene, farmer) {
        farmer.body.setVelocity(0); //stop farmer

        //play the stop (reset farmer to be a static idle image instead of an animation) 
        //farmer.anims.play(`walk-${farmer.direction}`);
        //farmer.anims.stop(); 
    }

    execute(scene, farmer, audio, turnip, noise) { //similar to check alerts but checks in more detail
        //if(distance (farmer, turnip) < 100)
        //create path from farmer to turnip
        //transition to chase state (pass it the initial path to follow)
    }
}

//follow direct path between farmer and turnip
//if turnip goes out of view, stop at the last place seen and search
class ChaseState extends FarmerState {
    constructor(scene) { super(scene); } //pass the scene into FarmerState to define the keys, methods, etc.

    enter(scene, farmer, audios) {
    }
    execute(scene, farmer, audios) {
        //update path from farmer to turnip
        //if(path < some max distance)
        //if(no obstacle is blocking path between farmer and turnip)
        //if turnip is in burrow state
        //transition to bury state (give it path to the hole tile)
        //else
        //follow path from farmer to turnip (make sure path is being updated)
        //else //obstacle is blocking path between farmer and turnip
        //create path to point past object and follow to that point.
        //if (follow path complete)
        //transition to search state

        // handle animation
        //farmer.anims.play(`walk-${farmer.direction}`, true);
    }
    exit(scene, farmer, audios) {
    }
}

//go to hole tile and bury it.
class BuryState extends FarmerState {
    constructor(scene) { super(scene); }

    enter(scene, farmer, audios, path) {
        //follow given path
    }

    execute(scene, farmer, audios, path) {
        //on path complete
        //replace hole tile with buried hole tile
        //somehow remove the hole tile from usable holes
        //transition to search state
    }
}

//select a random plant to water
//TODO: see if you can fit this logic in walk state instead of creating its own state
//TODO: see if the farmer should be altered in this state or not 
//(could be a mechanic to allow the player move close by the farmer while they're busy watering)
class WaterState extends FarmerState {
    constructor(scene) { super(scene); }

    enter(scene, farmer, audios) {
        //play a watering animation
    }

    execute(scene, farmer, audios, path) {
        //on animation complete
        //transition back to walk state (given the current path)
    }
}

//walk around the farm
//chooses a random path in subset of paths to follow
//on path complete, follows a different random path
class WalkState extends FarmerState {
    constructor(scene, map, farmer) {
        super(scene);
        this.paths = []; //array of different paths
        this.createPaths(scene, map);
        farmer.setPath(this.paths[0]);
        let startPoint = this.paths[0].getStartPoint();
        farmer.setPosition(startPoint.x, startPoint.y);

        // create the pathConfig defining details for the farmer following paths
        // note: you can mix properties from both types of config objects
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Tweens.html#.NumberTweenBuilderConfig
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.PathFollower.html#.PathConfig
        this.pathConfig = {
            startAt: 0,
            from: 0,            // points allow a path are values 0–1
            to: 1,
            delay: 0,
            //TODO: replace duration's number with binding calculated by the path's length
            //to have the farmer walk at the same speed reguardless of the path's length
            duration: 1000,
            ease: 'Power0',
            hold: 0,
            repeat: 0,
            yoyo: false,
            rotateToPath: false
        };
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
        farmer.startFollow(this.pathConfig);
    }

    execute(scene, farmer, audios) {
        //if(super.checkAlerts()) //if the farmer has been altered in some manner
        //transition to search state
        //if farmer is on top of a crop
        //calculate 25% chance
        //if success, transition to water state (pass it the current path)
        //on path complete
        //transition to walk state again (passing the current path) (AKA: finds a new path)

        if (!farmer.isFollowing()) {
            //used a delayed call because of update issue calling this before enter method completes
            scene.time.delayedCall(100, () => {
                if (!farmer.isFollowing()) {
                    this.stateMachine.transition("walk", farmer.path.name);
                }
            }, null, this);
        }
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
                path.draw(this.graphics);
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