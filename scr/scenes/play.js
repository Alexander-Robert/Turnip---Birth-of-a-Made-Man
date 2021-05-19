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

        //create audios object of different audios
        this.createAudio();

        //create background tilemap
        const field = this.add.tilemap("field_test");

        //add tileset to map
        const field_tileset = field.addTilesetImage("field_set", "field_set", 32, 32);
        const object_tileset = field.addTilesetImage("object_set", "object_set", 32, 32);

        //create tilemap layers
        this.backgroundLayer = field.createLayer("ground", field_tileset, 0 ,0);
        this.terrainLayer = field.createLayer("terrain", object_tileset, 0 ,0);
        this.cropsLayer = field.createLayer("crops", object_tileset, 0 ,0);
        

        //create our player character
        this.turnip = new Turnip(this, 100, 100, "turnip", 0, 'down').setScale(0.25);

        //bundle all this.anims.create statements into a separate function
        this.createAnimations();

        //set collisions
        this.backgroundLayer.setCollision([4, 5]);
        this.terrainLayer.setCollision([7, 8]);
        this.physics.add.collider(this.turnip, this.backgroundLayer);
        this.physics.add.collider(this.turnip, this.terrainLayer);

        //add UI images
        this.shop = this.add.sprite(0, 736, "shopUI").setOrigin(0);
        this.shop.setScrollFactor(0);
        this.tower = this.add.sprite(1280, 184, "tower").setOrigin(0);
        this.tower.setScrollFactor(0);
        this.pescotti = this.add.sprite(this.shop.x, this.shop.y, "pescotti").setOrigin(0);
        this.pescotti.setScrollFactor(0);

        //camera definitions
        //lock camera to map size bounds
        this.cameras.main.setName("main");
        this.cameras.main.setBounds(0,0,1280, 2000); //TODO: find out how to get the tilemap width and height
        //                           roundPixels = true,    0.5 is the y lerp (camera follow slugishness)
        this.cameras.main.startFollow(this.turnip, true, 1, 0.5);
        this.cameras.main.setDeadzone(0,100);
        
        //add minimap camera
        //TODO: fix it so minimap moves just like the main camera
        //TODO: create variables/consts to replace hard codes values with
        this.minimap = this.cameras.add(1280, 0, 1280, 736 / 4).setZoom(0.25);
        this.minimap.setName("minimap");
        this.minimap.setBounds(0,0,1280, 2000); //TODO: find out how to get the tilemap width and height
        //                           roundPixels = true,    0.5 is the y lerp (camera follow slugishness)
        this.minimap.startFollow(this.turnip, true, 1, 0.5);
        this.minimap.setDeadzone(0, 250); 

        this.minimap.ignore(this.shop);
        this.minimap.ignore(this.tower);
        this.minimap.ignore(this.pescotti);

        //temp keys for testing stats //TODO: remove when you've implemented interactions with tiles
        this.keys.Mkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.keys.Nkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keys.Bkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

        //define stats
        this.score = 0;
        this.crops = 0;

        //text configuration
        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '48px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }

        //TODO: figure out how to have text not scroll
        this.scoreText = this.add.text(1280,736, "s:" + this.score, textConfig);
        this.cropsText = this.add.text(1280,786, "c:" + this.crops, textConfig);

        //define the Finite State Machine (FSM) behaviors for the player
        this.turnipFSM = new StateMachine('idle', {
            idle: new IdleState(this),
            move: new MoveState(this),
            steal: new StealState(this),
            burrow: new BurrowState(this),
        }, [this, this.turnip, this.audios]);
        

        //crop collision
        this.radishes = field.createFromObjects("objects", {
            name: "radish",
            key: "object_set",
            frame: 3
        });

        this.physics.world.enable(this.radishes, Phaser.Physics.Arcade.STATIC_BODY);
        this.radishGroup = this.add.group(this.radishes);
        this.physics.add.overlap(this.turnip, this.radishGroup, (obj1, obj2) => {
            obj2.destroy(); // remove radish crop on overlap
            this.sound.play('harvest', {volume: 0.5});
        });
    }

    update() {

        //process current step within the turnipFSM
        this.turnipFSM.step();

        //TODO: reorganize this logic to work with turnip interacting with specific tiles
        if (Phaser.Input.Keyboard.JustDown(this.keys.Mkey)) {
            this.crops++;
            this.cropsText.text = "c:" + this.crops;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.Nkey)) {
            this.score += this.crops;
            this.crops = 0;
            this.cropsText.text = "c:" + this.crops;
            this.scoreText.text = "s:" + this.score;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.Bkey)) {
            this.scene.start("menuScene");
        }
    }

    //defines all audios into an object to pass to FSM that uses it.
    createAudio() {
        this.audios  = {};
        this.audios.running = this.sound.add('running', { loop: true });
    }

    
  

    //defines all the animations used in play.js
    createAnimations() {
        // this.anims.create({
        //     key: 'move-down',
        //     frameRate: 16,
        //     repeat: -1,
        //     frames: this.anims.generateFrameNames() //TODO: fill this out
        // });
    }
}