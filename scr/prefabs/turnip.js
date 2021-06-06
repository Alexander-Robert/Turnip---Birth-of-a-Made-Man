class Turnip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //create individual properties for Turnip
        this.direction = direction;
        this.velocity = 200;
        //this.body.setCollideWorldBounds(true); //doesn't need worldbounds as tilemap acts as that
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

    //returns the tile and tile name that turnip is currently on.
    checkTileType(scene, turnip, field) {
        //if turnip is off the map (in the case of being in the burrow state), return
        if(turnip.body.position.x < 0 || turnip.body.position.y < 0)
            return { tile: null, name: "none" };

        //check all corners of turnip and determine what tile the player probably wants to interact with
        //aka if there's only 1 interactible tile found in all corners of turnip, return that tile
        //otherwise return the tile in the center
        let turnipTopLeft = {
            x: turnip.body.position.x,
            y: turnip.body.position.y
        };
        let turnipTopRight = {
            x: turnip.body.position.x + (turnip.width * turnip.scaleX),
            y: turnip.body.position.y
        };
        let turnipBottomLeft = {
            x: turnip.body.position.x,
            y: turnip.body.position.y + (turnip.height * turnip.scaleY)
        };
        let turnipBottomRight = {
            x: turnip.body.position.x + (turnip.width * turnip.scaleX),
            y: turnip.body.position.y + (turnip.height * turnip.scaleY)
        };
        let turnipCenter = {
            x: turnip.body.position.x + ((turnip.width * turnip.scaleX) / 2),
            y: turnip.body.position.y + ((turnip.height * turnip.scaleY) / 2)
        };
        let turnipCorners = [turnipTopLeft, turnipTopRight, turnipBottomLeft, turnipBottomRight];
        let tiles = [];
        let uniqueTiles = 0;
        let tile;
        for (let i = 0; i < turnipCorners.length; ++i) {
            tiles.push(
                field.getTileAt(
                    field.worldToTileX(turnipCorners[i].x),
                    field.worldToTileY(turnipCorners[i].y),
                    true, "crops"));
            if ((tiles[i].index != -1))
                uniqueTiles++;
        }

        //if there's only 1 interactible tile around turnip
        //that's probably the tile the player wanted to choose
        if (uniqueTiles == 1) {
            for (let t of tiles) {
                if (t.index != -1) {
                    tile = t;
                    break;
                }
            }
        }
        else { //otherwise (0 or unique tiles > 1 )
            tile = field.getTileAt(
                field.worldToTileX(turnipCenter.x),
                field.worldToTileY(turnipCenter.y),
                true, "crops");
        }

        switch (tile.index) {
            case -1:
                return { tile: tile, name: "none" };
            case 6: //index values somewhat hardcoded as they are tilemap dependant
                return { tile: tile, name: "crop" };
            case 8:
                return { tile: tile, name: "hole" };
            default:
                // console.warn("found some other tile not listed");
                // console.log(tile);
                return { tile: tile, name: "other" };
        }
    }
}

//implementation for all the different FSM states for Turnip
class IdleState extends TurnipState {
    constructor(scene) { super(scene); } //pass the scene into TurnipState to define the keys, methods, etc.

    enter(scene, turnip) {
        turnip.body.setVelocity(0); //stop turnip
        this.stateMachine.setInfo("none");
        //reset turnip to be a static idle image instead of an animation
        turnip.anims.stop();
        turnip.setTexture('turnip down');
    }

    execute(scene, turnip, audios, field, stats) {
        if (this.stateMachine.transitioning) return;
        //check for transitions
        //if the interact key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) {
            let tileInfo = super.checkTileType(scene, turnip, field);
            if (tileInfo.name == "crop") {
                if (stats.crops != stats.maxCrops) {
                    this.stateMachine.transition('steal', tileInfo);
                    return;
                }
            }

            if (tileInfo.name == "hole") {
                //TODO: see if we need to give burrow additional info
                this.stateMachine.transition('burrow', tileInfo.tile);
                return;

            }
        }

        //if any of the move keys were pressed
        if (this.W.isDown || this.A.isDown || this.S.isDown || this.D.isDown) { 
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends TurnipState {
    constructor(scene) { super(scene); } //pass the scene into TurnipState to define the keys, methods, etc.

    enter(scene, turnip, audios) {
        audios.running.play();
    }
    execute(scene, turnip, audios, field, stats) {
        if (this.stateMachine.transitioning) return;
        //check for transitions
        //if the interact key is pressed 
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) {
            let tileInfo = super.checkTileType(scene, turnip, field);
            if (tileInfo.name == "crop") {
                if (stats.crops != stats.maxCrops){
                    this.stateMachine.transition('steal', tileInfo);
                    return;
                }
            }

            if (tileInfo.name == "hole") {
                this.stateMachine.transition('burrow', tileInfo.tile);
                return;

            }
        }

        //if turnip is running on crops
        if (super.checkTileType(scene, turnip, field).name == "crop") {
            this.stateMachine.setInfo("running over crops");
        }
        else {
            this.stateMachine.setInfo("running");
        }

        //if NONE of the move keys were pressed
        if (!(this.A.isDown || this.D.isDown || this.W.isDown || this.S.isDown)) {
            this.stateMachine.transition('idle');
            return;
        }

        // handle movement
        turnip.body.setVelocity(0);
        if (this.W.isDown) { //Up is pressed
            turnip.body.setVelocityY(-turnip.velocity);
            turnip.direction = 'up';

        } else if (this.S.isDown) { //Down is pressed
            turnip.body.setVelocityY(turnip.velocity);
            turnip.direction = 'down';
        }
        else if (this.A.isDown) { //Left is pressed
            turnip.body.setVelocityX(-turnip.velocity);
            turnip.direction = 'left';
        } else if (this.D.isDown) { //Right is pressed
            turnip.body.setVelocityX(turnip.velocity);
            turnip.direction = 'right';
        }
        // handle animation
        turnip.anims.play(`turnip-${turnip.direction}`, true);
    }
    exit(scene, turnip, audios) {
        audios.running.stop();
        turnip.body.setVelocity(0);
    }
}

class StealState extends TurnipState {
    constructor(scene) {
        super(scene);
        this.tileInfo;
    }

    enter(scene, turnip, audios, field, stats, tileInfo) {
        this.tileInfo = tileInfo;
        audios.harvest.play();
        this.stateMachine.setInfo("stealing");
    }

    execute(scene, turnip, audios, field, stats) {
        if (this.stateMachine.transitioning) return;
        stats.crops++;
        stats.totalCrops++;
        field.removeTileAt(this.tileInfo.tile.x, this.tileInfo.tile.y, false);
        this.stateMachine.transition("idle");
        return "steal";
    }
}

//I learned later on by the professor that the implementation for BurrowState fights the purpose
//of state machines by having it handle multiple objects (turnip and turnipUI)
//which is partially coded this way because it would have been an easier implementation 
//than using the same sprite had prior mechanics not been removed
class BurrowState extends TurnipState {
    constructor(scene, holes, pescotti) {
        super(scene);
        //uses different sprite to handle within the UI
        this.turnipUI = scene.physics.add.sprite(800, 810, 'turnip-enter', 0).setSize(0.6);
        this.turnipUI.velocity = 250;
        this.turnipUI.alpha = 0;
        this.holes = holes;
        this.pescotti = pescotti;
    }

    enter(scene, turnip, audios, field, stats, tile) {
        turnip.body.setVelocity(0);
        turnip.body.setEnable(false);
        this.stateMachine.setInfo("burrowing");

        audios.dig.play();
        let OceanisPaused = audios.ocean.isPaused;
        if (OceanisPaused == true) {
            audios.ocean.resume();
        }
        else {
            audios.ocean.play();
        }
        
        // handle animation
        this.holeIndex = this.findHole(tile);
        this.stateMachine.setInfo("burrowing", this.holes[this.holeIndex]);
        turnip.anims.play(`turnip-enter`);
        turnip.on('animationcomplete-turnip-enter', () => {
            turnip.setPosition(-1000, -1000); //put turnip off of the gameplay screen
            turnip.alpha = 0;
            this.turnipUI.x = this.holes[this.holeIndex].sprite.x;
            this.turnipUI.alpha = 1;
            this.turnipUI.play('turnip-exit');
            //this.enterTween.play();
            this.pescotti.play('poof anim').setScale(0.60);
            this.pescotti.on('animationcomplete', () => {
                this.pescotti.setScale(0.70);
                this.pescotti.setX(100);
                this.pescotti.setTexture('pescotti sale');
            });
        });
    }

    execute(scene, turnip, audios, field, stats) {
        if (this.stateMachine.transitioning) return;
        this.stateMachine.setInfo("none");
        //issue with transitions and execute method call times from state machine
        //requires this fix to stop turnip from moving everywhere
        if ((turnip.body.velocity.x != 0) || (turnip.body.velocity.y != 0))
            turnip.body.setVelocity(0);
        //check for transitions
        if (Phaser.Input.Keyboard.JustDown(this.SPACE)) { //if the interact key is pressed
            //check if turnip is overlapping with any exit tunnels (AKA trying to leave the shop)
            for (let hole of this.holes) {
                if (hole.sprite.covered != true) {
                    if (this.checkOverlap(this.turnipUI, hole.sprite)) {
                        this.turnipUI.play('turnip-enter');
                        this.turnipUI.on('animationcomplete-turnip-enter', () => {
                            this.turnipUI.body.setVelocityX(0);
                            this.turnipUI.alpha = 0;
                            this.pescotti.setX(20);
                            this.pescotti.play('poof anim').setScale(0.60);
                            this.pescotti.on('animationcomplete', () => {
                                this.pescotti.setScale(0.70);
                                this.pescotti.setX(20);
                                this.pescotti.setTexture('pescotti pool');
                            });
                            turnip.setPosition(
                                field.tileToWorldX(hole.location.x),
                                field.tileToWorldY(hole.location.y));
                            turnip.alpha = 1;
                            turnip.play("turnip-exit");
                            turnip.on('animationcomplete-turnip-exit', () => {
                                this.stateMachine.transition('idle');
                            });
                        });
                    }
                }
            }
            //otherwise check if turnip is close enough to the counter to sell his crops
            if ((this.turnipUI.body.position.x < 350)){
                if (stats.crops > 0) {
                    stats.score += stats.crops * 5;
                    stats.crops = 0;
                    audios.sell.play();
                }
            }
            return "burrow";
        }

        // handle movement
        if ((this.A.isDown) && (this.turnipUI.body.position.x > 310)) { //Left is pressed
            if (!this.turnipUI.anims.isPlaying || this.turnipUI.anims.currentAnim.key === 'turnip-right') {
                this.turnipUI.play('turnip-left');
            }
            this.turnipUI.body.setVelocityX(-this.turnipUI.velocity);
        } else if ((this.D.isDown) && (this.turnipUI.body.position.x < 800)) { //Right is pressed
            if (!this.turnipUI.anims.isPlaying || (this.turnipUI.anims.currentAnim.key === 'turnip-left')) {
                this.turnipUI.play('turnip-right');
            }
            this.turnipUI.body.setVelocityX(this.turnipUI.velocity);
        }
        //if NONE of the move keys were pressed
        else {
            if (this.turnipUI.anims.isPlaying
                && (this.turnipUI.anims.currentAnim.key === 'turnip-left'
                    || this.turnipUI.anims.currentAnim.key === 'turnip-right')) {
                this.turnipUI.anims.stop();
                this.turnipUI.setTexture('turnip down');
            }
            this.turnipUI.body.setVelocityX(0);
            return;
        }
    }

    exit(scene, turnip, audios) {
        audios.dig.play();
        audios.ocean.pause();
        
        turnip.alpha = 1;
        turnip.body.setEnable(true);
    }

    findHole(tile) {
        for (let i = 0; i < this.holes.length; ++i) {
            if (tile.x == this.holes[i].location.x && tile.y == this.holes[i].location.y) {
                return i;
            }
        }
        return 0;
    }

    //seems easier than doing physics collision because we only need on key press collision checking
    checkOverlap(turnip, hole) {
        let boundsA = turnip.getBounds();
        let boundsB = hole.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
}