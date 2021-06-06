class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    init(playtweens) { //check if we want to intro tween the previous screen snapshot
        this.playtweens = playtweens[0]; //I think this happens to be always true?
    }
    create() {
        console.log("created playScene!");
        
        this.music = this.sound.add('music', { volume: 0.2 }, { loop: true });
        this.music.play();

        if (this.playtweens) {
            let menuImage = this.add.image(0, 0, 'titlesnapshot').setOrigin(0).setDepth(1000);
            this.tweens.add({
                targets: menuImage,
                duration: 2500,
                ease: 'Back.easeInOut',
                x: { from: menuImage.x, to: -menuImage.width },
            });
        }

        //define key inputs
        //NOTE: keys must be defined before turnipFSM 
        //because the constructors for the states try to access this scene's defined keys
        this.keys = {}; //putting all keys as properties in keys obj helps keep the 'this.' namespace clean
        this.keys.Wkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.Akey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.Skey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.Dkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.Spacekey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        //special keys for devs or graders to use.
        this.restart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.loseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.winKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

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
        let emptyPath = this.add.path(); //which is why we pass it an empty path
        this.farmer = new Farmer(this, emptyPath, 500, 500, 'farmer down', 0, 'down').setScale(0.1);

        //bundle all this.anims.create statements into a separate function
        this.createAnimations();

        //set collisions for turnip and specific tilemap layers
        this.backgroundLayer.setCollision([4, 5]);
        this.terrainLayer.setCollision([7, 8]);
        this.physics.add.collider(this.turnip, this.backgroundLayer);
        this.physics.add.collider(this.turnip, this.terrainLayer);

        //bool to ensure game over transition tweens and code plays once
        this.locked = false;

        //define stats
        this.stats = {
            score: 0,
            crops: 0,
            maxCrops: 10,
            totalCrops: 0,
            escaped: 0,
            title: "Bag Man"
        };
        this.oldScore = this.stats.score; //used to check diff when game updates the score
        //a tween for values! Creates a nice eased counter when selling things at the shop
        //this binding gets reassigned later because of how tweens resist runtime value calculations
        this.easedcounter = this.tweens.addCounter({
            from: this.oldScore,
            to: this.stats.score,
            duration: 3000,
            ease: 'Linear',
            paused: true,
            onComplete: function() {
                this.oldScore = this.stats.score;
            },
            onCompleteScope: this
        });

        //text configuration for all the mob titles and UI text
        let titleTextConfig = {
            fontFamily: 'font1',
            fontSize: '32px',
            color: '#000000',
        }
        //text configuration for reputation counter only
        let pointsTextConfig = {
            fontFamily: 'font2',
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

        //define the UI images and text
        //many things are set to a specific depth to allow properly layering for game over transitions
        //it was much easier to do that than move definitions within the create method to have the correct layering
        //while also not breaking the code that requires it's definition.
        this.shop = this.add.sprite(0, 736, "shopUI").setOrigin(0);
        this.lightHouse = this.add.sprite(1280, 0, "light house", 0).setOrigin(0).setDepth(this.terrainLayer.depth + 2);
        this.pescotti = this.add.sprite(20, 736, "pescotti pool").setOrigin(0).setScale(0.70);
        this.bag = this.add.sprite(943, 750, "bagbear", 0).setOrigin(0).setScale(0.65);
        this.star = this.add.sprite(1300, 530, "star", 0).setOrigin(0.5,0).setDepth(this.terrainLayer.depth + 3);
        this.crops = this.add.text(1085, 765, this.stats.crops, titleTextConfig);
        this.maxCrops = 10;
        this.add.text(1115, 790, this.maxCrops, titleTextConfig);
        this.add.text(1175, 825, "crops", titleTextConfig);

        this.delay = 3000; //a binding to get game over tweens transitions to work properly
        //defining win and lose screen images tweens and values.
        this.winScreen = this.add.sprite(1280, 0, "win-screen").setOrigin(0).setDepth(this.terrainLayer.depth + 1);
        this.winScreen.alpha = 0;
        this.endScreenWinTween = this.tweens.add({
            targets: this.winScreen,
            x: {from: this.winScreen.x, to: 0},
            ease: 'Sine.easeInOut',
            duration: this.delay,
            paused: true,
        });

        this.loseScreen = this.add.sprite(0, 0, "lose-screen").setOrigin(0.5).setDepth(100);
        this.loseScreen.x = this.loseScreen.displayWidth/2;
        this.loseScreen.y = this.loseScreen.displayHeight/2;
        this.loseScreen.alpha = 0;
        this.endScreenLoseTween = this.tweens.add({
            targets: this.loseScreen,
            scale: {from: 0, to: 1},
            alpha: {from: 0, to: 1},
            ease: 'Sine.easeInOut',
            duration: this.delay,
            paused: true,
        });

        //one of the two star tweens when you rank up to a new title
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
                //this is the hole object properties definition
                //NOTE: sprite corresponds to the UI sprite
                    //while location corresponds to the in game tile position (in tile coordinates)
                sprite: null,
                location: {
                    x: foundHole.x,
                    y: foundHole.y
                },
            })
        }
        for (let i = 0; i < this.holes.length; i++) {
            //NOTE: while this code allows scalable hole connections, 
                //it doesn't handle scaleability for screen image placement
            this.holes[i].sprite = this.add.sprite(550 + (150 * i), 800, "hole").setScale(0.6);
        }

        this.scoreText = this.add.text(1290, 755, "Reputation " + this.stats.score, pointsTextConfig);

        //all the text for the different titles
        this.add.text(1420, 265, "Boss", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1382, 310, "Consigliere", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1385, 355, "Underboss", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1375, 395, "Caporegime", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1405, 440, "Soldier", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1390, 485, "Associate", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        this.add.text(1395, 535, "Bag Man", titleTextConfig).setDepth(this.terrainLayer.depth + 3);
        
        //define the Finite State Machine (FSM) behaviors for the player (turnip)
        //NOTE: both finite state machines allow specific things to be passed in the class constructors
            //which simplifies the method parameters when only one or a few states require a specific binding
        this.turnipFSM = new StateMachine('idle', {
            idle: new IdleState(this),
            move: new MoveState(this, this.turnip),
            steal: new StealState(this, this.maxCrops),
            burrow: new BurrowState(this, this.holes, this.pescotti),
        }, [this, this.turnip, this.audios, field, this.stats]);

        //define the Finite State Machine (FSM) behaviors for the farmer AI
        //NOTE: this FSM REQUIRES this, this.farmer to be passed to the constructor 
            //(see why in FarmerState class in farmer.js)
        this.farmerFSM = new StateMachine('walk', {
            search: new SearchState(this, this.farmer),
            lookAround: new LookState(this, this.farmer, this.stats),
            chase: new ChaseState(this, this.farmer),
            findPath: new findPathState(this, this.farmer, field),
            walk: new WalkState(this, this.farmer, field),
            bury: new BuryState(this, this.farmer, field),
        }, [this, this.farmer, this.audios, this.turnip]);
    }

    update() {
        //process current step within the turnipFSM and farmerFSM
        //step returns the return value of execute methods
        let turnipStep = this.turnipFSM.step(); 
        //farmer gets info from specific events given by the turnipFSM (i.e. actions/noises made by turnip)
        this.farmerFSM.step(this.turnipFSM.getInfo());

        //dev/grader keybinds to check different scenes
        if (Phaser.Input.Keyboard.JustDown(this.restart)) {
            this.music.stop();
            this.scene.start("menuScene", [false]);
        }
        if (Phaser.Input.Keyboard.JustDown(this.loseKey)) {
            this.playLoseAnimation();
        }
        if (Phaser.Input.Keyboard.JustDown(this.winKey)) {
            this.playWinAnimation();
        }

        //update the UI text values
        this.crops.text = this.stats.crops;
        if(this.oldScore != this.stats.score) {
            if(!this.easedcounter.isPlaying()) {
                //reassigns tween because tweens seem to define their behavoir at their definition
                //and don't have methods to reassign values within a tween
                this.easedcounter = this.tweens.addCounter({
                    from: this.oldScore,
                    to: this.stats.score,
                    duration: 3000,
                    ease: 'Cubic.easeIn',
                    paused: true,
                    onComplete: function() {
                        this.oldScore = this.stats.score;
                    },
                    onCompleteScope: this
                });
            }
            this.easedcounter.play();
            this.scoreText.text = "Reputation " + this.easedcounter.getValue().toFixed(0);
        }
        else { //safety code to make sure it updates correctly
            this.scoreText.text = "Reputation " + this.stats.score;
        }
        //update the UI images and tweens
        if (turnipStep == "steal" || turnipStep == "burrow") { 
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
            //long bit of code checking score ranges to give the precise runtime rank up tweens 
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
        //somewhat hard coded collision logic because the tweens wouldn't work with it for some reason
        if (!this.locked) {
            this.physics.world.collide(this.turnip, this.farmer, (turnip) => {
                turnip.body.setEnable(false);
                this.loseScreen.alpha = 1;
                this.transitionGameOver();
            }, null, this);
        }
        let loseCondition = true;
        for (let hole of this.holes) {
            if (hole.sprite.covered != true)
                loseCondition = false;
        }
        if (loseCondition) {
            this.playLoseAnimation();
        }
        //if we've collected all of the crops in the farm, we win!
        let winCondition = (this.stats.score >= 300);
        if (winCondition) {
            this.playWinAnimation();
        }
    }

    playLoseAnimation() {
        if(!this.endScreenLoseTween.isPlaying() && !this.locked) {
            this.locked = true;
            this.endScreenLoseTween.play();
            this.time.delayedCall(this.delay + 10, () => {
                this.transitionGameOver();
            }, null, this);
        }
    }
    playWinAnimation() {
        this.winScreen.alpha = 1;
        this.endScreenWinTween.play();
        this.time.delayedCall(this.delay + 10, () => {
            this.transitionGameOver();
        }, null, this);
    }
    transitionGameOver() {
        this.music.stop();
        this.audios.running.stop();
        this.audios.harvest.stop();
        this.audios.dig.stop();
        this.audios.sell.stop();
        this.audios.ocean.stop();

        let textureManager = this.textures;
            this.game.renderer.snapshot((image) => {
                // make sure an existing texture w/ that key doesn't already exist
                if(textureManager.exists('titlesnapshot')) {
                    textureManager.remove('titlesnapshot');
                }
                // take the snapshot img returned from callback and add to texture manager
                textureManager.addImage('titlesnapshot', image);
            });
        this.scene.start("gameOverScene", this.stats);
    }

    titleRankUp(yValue, title) {
        //creates new tween at each call because tweens define their behavoir at their definition
        //and don't have methods to reassign values within a tween
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
        this.audios.ocean = this.sound.add('ocean_waves', { loop: true });
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