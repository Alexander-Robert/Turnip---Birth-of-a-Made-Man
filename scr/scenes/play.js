class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    create() {
        console.log("created playScene!");

        this.music = this.sound.add('music', {volume: 0.2}, { loop: true }, );
        this.music.play();

        //define key inputs
        //NOTE: keys must be defined before turnipFSM 
        //because the constructors for the states try to access this scene's defined keys
        this.keys = {}; //putting all keys as properties in keys obj helps keep the 'this.' namespace clean
        this.keys.Wkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.Akey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.Skey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.Dkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.Spacekey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.Hkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        //create audios object of different audios
        this.createAudio();

        //create background tilemap
        const field = this.add.tilemap("field_test");

        //add tileset to map
        const field_tileset = field.addTilesetImage("field_set", "field_set", 32, 32);
        const object_tileset = field.addTilesetImage("object_set", "object_set", 32, 32);

        //create tilemap layers
        this.backgroundLayer = field.createLayer("ground", field_tileset, 0, 0);
        this.terrainLayer = field.createLayer("terrain", object_tileset, 0, 0);
        this.cropsLayer = field.createLayer("crops", object_tileset, 0, 0);
        this.pathsLayer = field.createLayer("paths", object_tileset, 0, 0);

        //create our player character
        this.turnip = new Turnip(this, 1000, 300, "turnip down", 0, 'down').setScale(0.25);

        //create out farmer AI (defined as a path follower which extends sprites)
        let emptyPath = this.add.path();
        this.farmer = new Farmer(this, emptyPath, 500, 500, 'farmer down', 0, 'down').setScale(0.1);

        //bundle all this.anims.create statements into a separate function
        this.createAnimations();

        //set collisions
        this.backgroundLayer.setCollision([4, 5]);
        this.terrainLayer.setCollision([7, 8]);
        this.physics.add.collider(this.turnip, this.backgroundLayer);
        this.physics.add.collider(this.turnip, this.terrainLayer);

        //define stats
        this.stats = {
            score: 0,
            crops: 0,
            totalCrops: 0,
            escaped: 0,
            title: "Bag Man"
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

        this.shop = this.add.sprite(0, 736, "shopUI").setOrigin(0);
        this.lightHouse = this.add.sprite(1280, 0, "light house", 0).setOrigin(0);
        this.pescotti = this.add.sprite(20, 736, "pescotti pool").setOrigin(0).setScale(0.70);
        this.bag = this.add.sprite(943, 750, "bagbear", 0).setOrigin(0).setScale(0.65);
        this.star = this.add.sprite(1300, 530, "star", 0).setOrigin(0.5,0);
        this.crops = this.add.text(1085, 765, this.stats.crops, titleTextConfig);
        this.maxCrops = 10;
        this.add.text(1115, 790, this.maxCrops, titleTextConfig);
        this.add.text(1175, 825, "crops", titleTextConfig);

        this.winScreen = this.add.sprite(1280, 0, "win-screen").setOrigin(0).setDepth(this.lightHouse.depth);
        this.winScreen.alpha = 0;
        this.endScreenTween = this.tweens.add({
            targets: this.winScreen,
            x: {from: this.winScreen.x, to: 0},
            ease: 'Sine.easeInOut',
            duration: 3500,
            paused: true,
        });

        this.starTweenGrow = this.tweens.add({
            targets: this.star,
            scale: {from: 1, to: 5},
            angle: {from: 0, to: 360},
            ease: 'Sine.easeInOut',
            repeat: 0,
            duration: 750,
            yoyo: true,
            hold: 1000,
            paused: true,
        });

        //find the number of holes in the tilemap
        //and create holes to match in the UI accordingly
        let numberOfHoles = 0;
        this.holes = [];
        while (true) {
            let foundHole = field.findByIndex(8, numberOfHoles);
            if (foundHole == null) break;
            numberOfHoles++;
            this.holes.push({
                sprite: null,
                location: {
                    x: foundHole.x,
                    y: foundHole.y
                },
            })
        }
        for (let i = 0; i < this.holes.length; i++) {
            this.holes[i].sprite = this.add.sprite(500 + (150 * i), 800, "hole").setScale(0.6);
            this.holes[i].sprite.setScrollFactor(0);
        }

        this.scoreText = this.add.text(1290, 755, "Reputation " + this.stats.score, pointsTextConfig);

        //text array for highlighting the current title
        this.titlesText = [];
        this.titlesText.push(this.add.text(1420, 265, "Boss", titleTextConfig));
        this.titlesText.push(this.add.text(1378, 310, "Consigliere", titleTextConfig));
        this.titlesText.push(this.add.text(1385, 355, "Underboss", titleTextConfig));
        this.titlesText.push(this.add.text(1375, 395, "Caporegime", titleTextConfig));
        this.titlesText.push(this.add.text(1405, 440, "Soldier", titleTextConfig));
        this.titlesText.push(this.add.text(1390, 485, "Associate", titleTextConfig));
        this.titlesText.push(this.add.text(1395, 535, "Bag Man", titleTextConfig));
        
        //define the Finite State Machine (FSM) behaviors for the player
        this.turnipFSM = new StateMachine('idle', {
            idle: new IdleState(this),
            move: new MoveState(this, this.turnip),
            //TODO: make steal and burrow state spawn/delete crops in bag UI respectively. 
            steal: new StealState(this, this.stats, this.maxCrops),
            burrow: new BurrowState(this, this.stats, this.holes, this.pescotti),
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


        if (Phaser.Input.Keyboard.JustDown(this.Hkey)) {
            this.winScreen.alpha = 1;
            this.endScreenTween.play();
        }

        //TODO: can use farmer's info to see what type of crop he's closest to
        //allows for pescotti to reward more points for stealing crops close to the farmer
        let currentState = this.farmerFSM.getState();
        if (this.savedState != currentState) {
            console.log(currentState);
            this.savedState = currentState;
        }

        if (turnipStep == "steal" || turnipStep == "burrow") { //update the UI
            if (turnipStep == 'burrow')
                this.scoreText.text = "Reputation " + this.stats.score;
            this.crops.text = this.stats.crops;
            if (this.stats.crops < 3)
                this.bag.setFrame(0);
            else if (this.stats.crops >= 3 && this.stats.crops <= 6)
                this.bag.setFrame(1);
            else
                this.bag.setFrame(2);
            if (this.stats.crops == this.maxCrops)
                this.crops.setX(1078);
            else
                this.crops.setX(1085);

            if (this.stats.score >= 50 && this.stats.score < 100) {
                if(this.star.y != 485)
                    this.titleRankUp(485, "Associate");
            }
            else if (this.stats.score >= 100 && this.stats.score < 150) {
                if(this.star.y != 440)
                    this.titleRankUp(440, "Soldier");
            }
            else if (this.stats.score >= 150 && this.stats.score < 200) {
                if(this.star.y != 395)
                    this.titleRankUp(395, "Caporegime");
            }
            else if (this.stats.score >= 200 && this.stats.score < 250) {
                if(this.star.y != 355)
                    this.titleRankUp(355, "Underboss");
            }
            else if (this.stats.score >= 250 && this.stats.score < 300) {
                if(this.star.y != 310)
                    this.titleRankUp(310, "Consigliere");
            }
            else if (this.stats.score >= 300 && this.stats.score < 350) {
                if(this.star.y != 265)
                    this.titleRankUp(265, "Boss");
            }
        }

        //check lose conditions: (farmer and turnip collision or all holes covered)
        let loseCondition = true;
        for (let hole of this.holes) {
            if (hole.sprite.covered != true)
                loseCondition = false;
        }
        //TODO: replace menuScene transition to gameOverScene transition 
        //gameOver scene: (display game info: final title achieved, reputation, crops stolen, num of times escaped, 
        //can also: restart game or back to main menu)
        if (loseCondition) {
            this.scene.start("gameOverScene", this.stats);
        }
    }

    titleRankUp(yValue, title) {
        this.tweens.add({
            targets: this.star,
            y: { from: this.star.y, to: yValue },
            ease: 'Back.easeInOut',
            repeat: 0,
            duration: 1500,
        });
        this.starTweenGrow.play();
        this.lightHouse.play('light up');
        this.stats.title = title;
    }

    //defines all audios into an object to pass to FSM that uses it.
    createAudio() {
        this.audios = {};
        this.audios.running = this.sound.add('running', { loop: true });
        this.audios.harvest = this.sound.add('harvest', {volume: 0.5});
        this.audios.dig = this.sound.add('dig', {volume: 0.4});
        this.audios.sell = this.sound.add('sell', {volume: 0.5});
    }




    //defines all the animations used in play.js
    createAnimations() {
        //lighthouse anim
        this.anims.create({ //question symbol appear above farmer when he's chasing
            key: 'light up', duration: 1000, repeat: 2, yoyo: true,
            frames: this.anims.generateFrameNames('light house', { first: 0, end: 1}),
        });
        //pescotti poof anim
        this.anims.create({
            key: 'poof anim', frameRate: 6, repeat: 0,
            frames: this.anims.generateFrameNames('poof', { first: 0, end: 7 }),
        });

        //turnip anims
        this.anims.create({
            key: 'turnip-up', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('turnip_up', { first: 0, end: 1 }),
        });
        this.anims.create({
            key: 'turnip-down', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('turnip_down', { first: 0, end: 1 }),
        });
        this.anims.create({
            key: 'turnip-left', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('turnip_left', { first: 0, end: 3 }),
        });
        this.anims.create({
            key: 'turnip-right', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('turnip_right', { first: 0, end: 3 }),
        });
        this.anims.create({ //entering a hole
            key: 'turnip-enter', frameRate: 16, repeat: 0,
            frames: this.anims.generateFrameNames('turnip_enter', { first: 0, end: 11 }),
        });
        this.anims.create({ //exiting a hole
            key: 'turnip-exit', frameRate: 16, repeat: 0,
            frames: this.anims.generateFrameNames('turnip_exit', { first: 0, end: 5 }),
        });

        //farmer anims
        this.anims.create({
            key: 'farmer-up', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('farmer_up', { first: 0, end: 3 }),
        });
        this.anims.create({
            key: 'farmer-down', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('farmer_down', { first: 0, end: 3 }),
        });
        this.anims.create({
            key: 'farmer-left', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('farmer_left', { first: 0, end: 4 }),
        });
        this.anims.create({
            key: 'farmer-right', frameRate: 8, repeat: -1,
            frames: this.anims.generateFrameNames('farmer_right', { first: 0, end: 3 }),
        });
        this.anims.create({ //warning symbol appear above farmer when he's chasing
            key: 'warning anim', frameRate: 8, repeat: 0,
            frames: this.anims.generateFrameNames('warning', { first: 0, end: 3}),
        });
        this.anims.create({ //question symbol appear above farmer when he's chasing
            key: 'question anim', frameRate: 8, repeat: 0,
            frames: this.anims.generateFrameNames('question', { first: 0, end: 3}),
        });
    }
}