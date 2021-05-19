class Farmer extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame);
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
    constructor(scene) {
        super(scene);
        this.createPaths();
    }

    enter(scene, farmer, audios, path, wateredPlant) {
        //if(wateredPlant) //if we just watered a plant
        //continure following the given path
        //else
        //choose random path (excluding the given path)
        //follow path
        console.log("walk state");
        this.farmerPath = scene.add.path(100, 100); // start of path
        this.farmerPath.lineTo(100, 300);         // next path point
        this.farmerPath.lineTo(150, 500);         // next
        this.farmerPath.lineTo(200, 400);          // next
        this.farmerPath.lineTo(150, 150);          // and back to start
        this.farmerPath.draw(this.graphics);            // draw path
        let s = this.farmerPath.getStartPoint();   // get start point of path
        // add path follower: follower(path, x, y, texture [, frame])
        //farmer = scene.add.follower(this.farmerPath, s.x, s.y, 'farmer').setScale(0.5);
        // start path follow with config
        // note: you can mix properties from both types of config objects
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Tweens.html#.NumberTweenBuilderConfig
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.PathFollower.html#.PathConfig
        farmer.startFollow({
            from: 0,            // points allow a path are values 0–1
            to: 1,
            delay: 0,
            duration: 10000,
            ease: 'Power0',
            hold: 0,
            repeat: -1,
            yoyo: false,
            rotateToPath: true
        });
    }

    execute(scene, farmer, audios, transitioning) {
        //if(super.checkAlerts()) //if the farmer has been altered in some manner
        //transition to search state
        //if farmer is on top of a crop
        //calculate 25% chance
        //if success, transition to water state (pass it the current path)
        //on path complete
        //transition to walk state again (passing the current path) (AKA: finds a new path)
    }

    createPaths() {

    }
}