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
        this.pathsLayer = field.createLayer("paths", object_tileset, 0 ,0);

        //create our player character
        this.turnip = new Turnip(this, 800, 500, "turnip", 0, 'down').setScale(0.25);

        //create out farmer AI (defined as a path follower which extends sprites)
        let emptyPath = this.add.path();
        this.farmer = new Farmer(this, emptyPath, 500, 500, 'farmer', 0, 'down');

        //bundle all this.anims.create statements into a separate function
        this.createAnimations();

        //set collisions
        this.backgroundLayer.setCollision([4, 5]);
        this.terrainLayer.setCollision([7, 8]);
        this.physics.add.collider(this.turnip, this.backgroundLayer);
        this.physics.add.collider(this.turnip, this.terrainLayer);

        this.shop = this.add.sprite(0, 736, "shopUI").setOrigin(0);
        this.lightHouse = this.add.sprite(1280, 0, "light house").setOrigin(0);
        this.pescotti = this.add.sprite(this.shop.x, this.shop.y, "pescotti").setOrigin(0);
        this.bag = this.add.sprite(1158, 736, "bag").setOrigin(0);
        this.reputation = this.add.sprite(1280, 736, "reputation").setOrigin(0);

        //find the number of holes in the tilemap
        //and create holes to match in the UI accordingly
        let numberOfHoles = 0;
        this.holes = [];
        while(true) {
            let foundHole = field.findByIndex(8, numberOfHoles);
            if(foundHole == null) break;
            numberOfHoles++;
            this.holes.push({
                sprite: null,
                location: {
                    x: foundHole.x,
                    y: foundHole.y
                },
            })
        }
        for(let i = 0; i < this.holes.length; i++){
            this.holes[i].sprite = this.add.sprite(600 + (200 * i), 786, "hole").setScale(0.75);
            this.holes[i].sprite.setScrollFactor(0);
        }

        //define stats
        this.stats = {
            score: 0,
            crops: 0,
            totalCrops: 0,
            escaped: 0,
            title: "none"
        };

        //text configuration
        let titleTextConfig = {
            fontFamily: 'Lobster',
            fontSize: '32px',
            color: '#000000',
        }
        let pointsTextConfig = {
            fontFamily: 'COWBOY JUNIOR',
            fontSize: '62px',
            color: '#843605',
            align: 'center',
            wordWrap: { width: 300, useAdvancedWrap: true },
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        
        this.scoreText = this.add.text(1290,745, "Reputation " + this.stats.score, pointsTextConfig);
        
        //text array for highlighting the current title
        this.titlesText = [];
        this.titlesText.push(this.add.text(1420,265, "Boss", titleTextConfig));
        this.titlesText.push(this.add.text(1378,310, "Consigliere", titleTextConfig));
        this.titlesText.push(this.add.text(1385,355, "Underboss", titleTextConfig));
        this.titlesText.push(this.add.text(1375,395, "Caporegime", titleTextConfig));
        this.titlesText.push(this.add.text(1405,440, "Soldier", titleTextConfig));
        this.titlesText.push(this.add.text(1390,485, "Associate", titleTextConfig));
        this.titlesText.push(this.add.text(1395,535, "Bag Man", titleTextConfig));

        //define the Finite State Machine (FSM) behaviors for the player
        this.turnipFSM = new StateMachine('idle', {
            idle: new IdleState(this),
            move: new MoveState(this, this.turnip),
            //TODO: make steal and burrow state spawn/delete crops in bag UI respectively. 
            steal: new StealState(this, this.stats), 
            burrow: new BurrowState(this, this.stats, this.holes),
        }, [this, this.turnip, this.audios, field]);

        //define the Finite State Machine (FSM) behaviors for the farmer AI
        this.farmerFSM = new StateMachine('walk', {
            search: new SearchState(this, this.farmer),
            chase: new ChaseState(this, this.farmer, this.stats),
            findPath: new findPathState(this, this.farmer, field),
            walk: new WalkState(this, this.farmer, field),
            water: new WaterState(this, this.farmer),
            bury: new BuryState(this, this.farmer, field),
        }, [this, this.farmer, this.audios, this.turnip]);

        //TODO: remove when farmer AI is complete
        //checker for printing states whenever the state changes
        this.savedState = 'walk';
    }

    update() {
        //process current step within the turnipFSM and farmerFSM
        let turnipStep = this.turnipFSM.step(); //step returns the return value of execute methods
        let farmerStep = this.farmerFSM.step(this.turnipFSM.getInfo());
        
        //TODO: can use farmer's info to see what type of crop he's closest to
        //allows for pescotti to reward more points for stealing crops close to the farmer
        let currentState = this.farmerFSM.getState();
        if (this.savedState != currentState){
            console.log(currentState);
            this.savedState = currentState;
        }

        if(turnipStep == "steal") { //update the text
            //TODO: update bag image
        }
        if(turnipStep == "burrow") { //update the text
            this.scoreText.text = "Reputation " + this.stats.score;
            //TODO: update bag image
        }

        //check lose conditions: (farmer and turnip collision or all holes covered)
        let loseCondition = true;
        for(let hole of this.holes) {
            if (hole.sprite.covered != true)
                loseCondition = false;
        }
        //TODO: replace menuScene transition to gameOverScene transition 
        //gameOver scene: (display game info: final title achieved, reputation, crops stolen, num of times escaped, 
        //can also: restart game or back to main menu)
        if(loseCondition) {
            this.scene.start("gameOverScene", this.stats);
        }
    }

    //defines all audios into an object to pass to FSM that uses it.
    createAudio() {
        this.audios  = {};
        this.audios.running = this.sound.add('running', { loop: true });
        this.audios.harvest = this.sound.add('harvest', {volume: 0.5});
    }

    
  

    //defines all the animations used in play.js
    createAnimations() {
        //turnip anims
        // this.anims.create({
        //     key: 'move-down',
        //     frameRate: 16,
        //     repeat: -1,
        //     frames: this.anims.generateFrameNames() //TODO: fill this out
        // });

        //farmer anims
        //warning symbol appear above farmer when he's chasing
        this.anims.create({
            key: 'warning anim',
            frames: this.anims.generateFrameNames('warning', {
                first: 0,
                end: 3,
            }),
            frameRate: 7,
        });
        //question symbol appear above farmer when he's chasing
        this.anims.create({
            key: 'question anim',
            frames: this.anims.generateFrameNames('question', {
                first: 0,
                end: 3,
            }),
            frameRate: 7,
        });
    }
}