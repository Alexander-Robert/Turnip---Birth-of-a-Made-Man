class Turnip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //create individual properties for Turnip
        this.direction = direction;
        this.velocity = 200;
        //this.body.setCollideWorldBounds(true);
    }
}
//inherits from State; Acts as an abstract class to define properties and methods common among all subclasses
class TurnipState extends State {
    constructor(scene) {
        //subclass constructors require that you call the super constructor:
        //https://stackoverflow.com/questions/31067368/how-to-extend-a-class-without-having-to-use-super-in-es6
        super(); 
        this.W = scene.keys.Wkey;
        this.A = scene.keys.Akey;
        this.S = scene.keys.Skey;
        this.D = scene.keys.Dkey;
        this.SPACE = scene.keys.Spacekey;
    }

    enter(scene, turnip) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.enter(scene, turnip, ...args); to use the common behaviors
    }

    execute(scene, turnip) { //TODO: define any extra parameters needed
        //TODO: define any commonality that all states use
        //subclasses will call super.execute(scene, turnip, ...args); to use the common behaviors
    }

    checkTileType() { //probably will need the scene parameter to access the current tile.
        //define the check tile type and have it return the name for it.
        //TODO: see if we should implement the interact key transitions here (is it even possible?)
    }
}

//implementation for all the different FSM states for Turnip
class IdleState extends TurnipState {
    constructor(scene) {super(scene);} //pass the scene into TurnipState to define the keys, methods, etc.

    enter(scene, turnip) {
        turnip.body.setVelocity(0); //stop turnip
        //if(turnip.isTinted) turnip.clearTint();
        //play the stop (reset turnip to be a static idle image instead of an animation) 
        //turnip.anims.play(`walk-${turnip.direction}`);
        //turnip.anims.stop(); 
    }

    execute(scene, turnip) {
        //check for transitions
        //TODO: see if we want .JustDown(SPACE) or SPACE.isDown
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) { //if the interact key is pressed 
            this.stateMachine.transition('burrow');
            //check type of tile turnip is on. 
                //If the type is an interactible tile, 
                //transition to the corresponding state
        }

        if(this.W.isDown || this.A.isDown || this.S.isDown || this.D.isDown) { //if any of the move keys were pressed
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends TurnipState {
    constructor(scene) {super(scene);} //pass the scene into TurnipState to define the keys, methods, etc.

    enter(scene, turnip, audios){
        audios.running.play();
    }
    execute(scene, turnip, audios, transitioning) {
        //check for transitions
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) { //if the interact key is pressed 
            this.stateMachine.transition('burrow');
            //check type of tile turnip is on. 
                //If the type is an interactible tile, 
                //transition to the corresponding state

            //return; //for after the correct transition is executed.
        }

        //if NONE of the move keys were pressed
        if(!(this.A.isDown || this.D.isDown || this.W.isDown || this.S.isDown)) { 
            this.stateMachine.transition('idle');
            return;
        }

        // handle movement
        turnip.body.setVelocity(0);
        if(this.W.isDown) { //Up is pressed
            turnip.body.setVelocityY(-turnip.velocity);
            turnip.direction = 'up';

        } else if(this.S.isDown) { //Down is pressed
            turnip.body.setVelocityY(turnip.velocity);
            turnip.direction = 'down';
        }
        if(this.A.isDown) { //Left is pressed
            turnip.body.setVelocityX(-turnip.velocity);
            turnip.direction = 'left';
        } else if(this.D.isDown) { //Right is pressed
            turnip.body.setVelocityX(turnip.velocity);
            turnip.direction = 'right';
        }
        // handle animation
        //turnip.anims.play(`walk-${turnip.direction}`, true);
    }
    exit(scene, turnip, audios) {
        audios.running.stop();
        turnip.body.setVelocity(0);
    }
}

class StealState extends TurnipState {
    constructor(scene) {super(scene);}

    enter(scene, turnip, audios) {

    }

    execute(scene, turnip, audios) {

    }
}

class BurrowState extends TurnipState {
    constructor(scene) { 
        super(scene);
        this.turnipUI = scene.physics.add.sprite(800, 800, 'turnip').setSize(0.75);
        this.turnipUI.setScrollFactor(0);
        this.turnipUI.velocity = 150;
        this.turnipUI.alpha = 0;
    }

    enter(scene, turnip, audios) {
        turnip.body.setVelocity(0);
        console.log(turnip.body.velocity.x + " " + turnip.body.velocity.y);
        //play burrow animation
        //on animation complete
            //make turnip invisible
            //ask farmerFSM if it should cover the hole or not.
            //create a separate sprite in the shop UI that player controls
            //play an entrance animation to the shop UI
        
        turnip.alpha = 0;
        this.turnipUI.body.position.x = 800;
        this.turnipUI.alpha = 1;

    }

    execute(scene, turnip, audios, transitioning) {
        if((turnip.body.velocity.x != 0) || (turnip.body.velocity.y != 0))
            turnip.body.setVelocity(0);
        //check for transitions
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) { //if the interact key is pressed 
            this.stateMachine.transition('idle');
            //check type of tile turnip is on.
                //If the type is an interactible tile, 
                //transition to the corresponding state

            //return; //for after the correct transition is executed.
        }

        // handle movement
        if((this.A.isDown) && (this.turnipUI.body.position.x > 215)) { //Left is pressed
                this.turnipUI.body.setVelocityX(-this.turnipUI.velocity);
                //TODO: flip sprite image left facing
        } else if((this.D.isDown) && (this.turnipUI.body.position.x < 1215)) { //Right is pressed
                this.turnipUI.body.setVelocityX(this.turnipUI.velocity);
                //TODO: flip sprite image right facing 
        }
        //if NONE of the move keys were pressed
        else {
            this.turnipUI.body.setVelocityX(0);           
            //stop moving animation
            return;
        }

        // handle animation
        //turnip.anims.play(`walk-${turnip.direction}`, true);
    }

    exit(scene, turnip, audios) {
        //play exit shop animation
        //on animation complete
            //delete the separate sprite in the shop UI that player controls
            //play an exit burrow animation
            //make turnip visible again

            turnip.alpha = 1;

            this.turnipUI.body.setVelocityX(0);
            this.turnipUI.alpha = 0;
    }
}