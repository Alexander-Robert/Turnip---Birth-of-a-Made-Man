class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    create() {
        console.log("created playScene!");

        //define key inputs
        //NOTE: keys must be defined before turnipFSM 
        //because the constructors for the states try to access this scene's defined keys
        this.keys = {}; //putting all keys as properties in keys obj helps keep the 'this.' namespace clean
        this.keys.Wkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.Akey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.Skey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.Dkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.Spacekey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //create background tilemap
        const field = this.add.tilemap("field_test");

        //add tileset to map
        const field_tileset = field.addTilesetImage("field_set", "field_set");

        //create tilemap layers
        this.backgroundLayer = field.createLayer("ground", field_tileset, 0 ,0);

        //create our player character
        this.turnip = new Turnip(this, game.config.width / 2, game.config.height / 2, "turnip", 0, 'down');

        //define the Finite State Machine (FSM) behaviors for the player
        this.turnipFSM = new StateMachine('idle', {
            idle: new IdleState(this),
            move: new MoveState(this),
            steal: new StealState(this),
            burrow: new BurrowState(this),
        }, [this, this.turnip]);

        //bundle all this.anims.create statements into a separate function
        this.createAnimations();

        //set collisions
        this.backgroundLayer.setCollision([2, 4, 5]);
        this.physics.add.collider(this.turnip, this.backgroundLayer);

        //camera definitions
        //lock camera to map size bounds
        this.cameras.main.setBounds(0,0,1280, 1000); //TODO: find out how to get the tilemap width and height
        //                           roundPixels = true,    0.5 is the y lerp (camera follow slugishness)
        this.cameras.main.startFollow(this.turnip, true, 1, 0.5);
        this.cameras.main.setDeadzone(0,100);


        this.minimap = this.cameras.add((game.config.width/2) - (1280 * 0.125), 
        -(game.config.height/2) - 15, 1280, 1000).setZoom(0.25);

        //when shop UI is added, //this.shop.setScrollFactor(0); //keeps on screen at all times
        //other UI would be the tower of mob titles
    }

    update() {
        //process current step within the turnipFSM
        this.turnipFSM.step();
    }

    //defines all the animations used in play.js
    createAnimations() {
        this.anims.create({
            key: 'move-down',
            frameRate: 16,
            repeat: -1,
            frames: this.anims.generateFrameNames() //TODO: fill this out
        });
    }
}