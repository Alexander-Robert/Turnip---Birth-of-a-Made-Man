class Menu extends Phaser.Scene {
    constructor () {
        super("menuScene");
    }
    init(playtweens) {
        this.playtweens = playtweens[0];
    }
    create(){

        //background menu images
        this.white               = this.add.image(0, 0, "white").setOrigin(0);
        this.pink                = this.add.image(0, 0, "pink").setOrigin(0);
        this.purple              = this.add.image(375, 0, "purple").setOrigin(0);
        ///create all menu images
        this.a_game_by           = this.add.image(1080, 60, "a-game-by").setOrigin(0);
        this.alex_robert         = this.add.image(775, 130, "alex-robert").setOrigin(0);
        this.birth_of_a_made_man = this.add.image(420, 70, "birth-of-a-made-man").setOrigin(0);
        this.fiona_hsu           = this.add.image(1080, 130, "fiona-hsu").setOrigin(0);
        this.thea_gamez          = this.add.image(1330, 130, "thea-gamez").setOrigin(0);
        this.turnip_throne       = this.add.image(180, 290, "turnip-throne").setOrigin(0);
        this.turnip_title        = this.add.image(64, 125, "turnip-title").setOrigin(0);
        
        //create buttons
        this.buttons = [];
        this.buttonStart = this.add.sprite(1130, 665, 'start-game', 0).setOrigin(0);
        this.buttonInstructions = this.add.sprite(1050, 745, 'instructions', 0).setOrigin(0);
        this.buttonCredits = this.add.sprite(1280, 825, 'credits', 0).setOrigin(0);
        this.buttonExit = this.add.sprite(64, 32, 'exit button', 0).setOrigin(0).setDepth(100);
        this.buttonLeftArrow = this.add.sprite(128, 32, 'arrow button', 0).setOrigin(0).setFlipX(true).setDepth(100);
        this.buttonRightArrow = this.add.sprite(160, 32, 'arrow button', 0).setOrigin(0).setDepth(100);
        this.buttons.push(this.buttonStart, this.buttonCredits, this.buttonInstructions,
            this.buttonExit, this.buttonLeftArrow, this.buttonRightArrow);

        if (this.playtweens) { //if we're entering the menu scene and want to play the intro
            this.buttonStart.x = game.config.width;
            this.buttonInstructions.x = game.config.width;
            this.buttonCredits.x = game.config.width;
            this.turnip_throne.x = (game.config.width / 2) - (this.turnip_throne.width / 2);
            this.turnip_title.x = (game.config.width / 2) - (this.pink.width / 2) - (this.turnip_title.width / 2);
            this.birth_of_a_made_man.x = (game.config.width / 2) + (this.pink.width / 2) - (this.birth_of_a_made_man.width / 2);

            this.birth_of_a_made_man.alpha = 0;
            this.turnip_throne.alpha = 0;
            this.thea_gamez.alpha = 0;
            this.fiona_hsu.alpha = 0;
            this.a_game_by.alpha = 0;
            this.alex_robert.alpha = 0;
            this.turnip_title.alpha = 0;

            //create tweens for images
            this.createTweens();
        }
        else { //if we don't want to play the intro, then create button's functionality
            this.initializeButtons();
        }

        //text configuration
        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '36px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            align: 'center',
        }
        
        this.tutorialGroup = this.add.group({});
        this.infoScreen = this.add.image(0,0, 'info-screen', 0).setOrigin(0);
        this.infoScreen.lastFrame = 9; //couldn't find phaser method to find final frame so it's hardcoded

        this.tutorialGroup.add(this.infoScreen);
        this.tutorialGroup.add(this.buttonExit);
        this.tutorialGroup.add(this.buttonLeftArrow);
        this.tutorialGroup.add(this.buttonRightArrow);
        this.tutorialGroup.setVisible(0);
        this.tutorial = false; //bool for displaying game info screen
        this.start = false;

        this.tutorialText = [];
        this.tutorialText.push(this.add.text(150, 190,
            "This is what the game looks like\nLet's start with the basics", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "You play as this bunny named Turnip", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "Turnip is trying to steal crops from a farm,\nfor a sinister plan", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "Turnip has a few different burrows in the farm.\nHe can use those to go and sell his crops to the mob", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "The shopkeeper, Pescotti is glad to take\n those precious crops off Turnip's hand", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "In exchange, Turnip gains reputation in the mob", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "In the beginning,\nTurnip has the lowly title of Bag Man", textConfig));
        this.tutorialText.push(this.add.text(150, 190,
            "With enough reputation,\nTurnip can rise through the tower of titles!", textConfig));
        this.tutorialText.push(this.add.text(150, 100,
            "But beware of the farmer!\nIf the farmer hears or sees you,\nthen you'll be in trouble", textConfig));
        this.tutorialText.push(this.add.text(150, 100,
            "It's game over if you get caught or\nif they close off all burrows to the shop.\nGood luck!", textConfig));
    }

    update() {
        if(this.start)
            this.scene.start("playScene");

        if(this.tutorial) {
            this.tutorialGroup.setVisible(1);
            for(let i = 0; i < this.tutorialText.length; ++i) {
                if(i == parseInt(this.infoScreen.frame.name)) {
                    this.tutorialText[i].alpha = 1;
                }
                else
                    this.tutorialText[i].alpha = 0;
            }
        }
        else {
            this.tutorialGroup.setVisible(0);
            for(let i = 0; i < this.tutorialText.length; ++i)
                    this.tutorialText[i].alpha = 0;
        }
    }

    //creates functionality for all the menu buttons
    initializeButtons() {
        //define specific button click methods
        //function requires us to pass the wrapper(i.e. the scene) of the tutorial property
        //because Javascript does not pass by reference!
        this.buttonStart.click = function (scene) {
            scene.start = true;
        };
        this.buttonCredits.click = function (scene) {
            //scene.credits.alpha = (scene.credits.alpha) ? 0 : 1; 
        };
        this.buttonInstructions.click = function (scene) {
            scene.tutorial = true;
        };
        this.buttonExit.click = function (scene) {
            scene.tutorial = false;
        };
        this.buttonLeftArrow.click = function (scene) {
            let frameName = parseInt(scene.infoScreen.frame.name);
            if(frameName != 0)
                scene.infoScreen.setFrame(parseInt(frameName) - 1);
            else
                scene.infoScreen.setFrame(scene.infoScreen.lastFrame);
        };
        this.buttonRightArrow.click = function (scene) {
            let frameName = parseInt(scene.infoScreen.frame.name);
            if(frameName != scene.infoScreen.lastFrame)
                scene.infoScreen.setFrame(frameName + 1);
            else
                scene.infoScreen.setFrame(0);
            
        };
        //define interactibility will all buttons
        for (let button of this.buttons) {
            button.setInteractive({
                useHandCurson: true,
            });
            button.on('pointerdown', () => {
                button.setFrame(2);
                button.click(this);
            });
            button.on('pointerover', () => {
                button.setFrame(1);
            });
            button.on('pointerout', () => {
                button.setFrame(0);
            });
            button.on('pointerup', () => {
                button.setFrame(0);
            });
        }
    }

    createTweens() {
        this.pinkTween = this.tweens.add({
            targets: this.pink,
            x: { from: game.config.width, to: -this.pink.width},
            ease: 'Sine.easeInOut',
            duration: 750,
            repeat: 1,
            onRepeat: function() {
                this.pinkTween.duration -= 250;
            },
            onRepeatScope: this,
            onComplete: function() {
                this.pinkMiddleStopTween.play();
            },
            onCompleteScope: this
        });
        this.pinkMiddleStopTween = this.tweens.add({
            targets: this.pink,
            x: { from: game.config.width, to: (game.config.width / 2) - this.pink.width},
            ease: 'Quint.easeOut',
            duration: 1500,
            paused: true
        });
        this.purpleTween = this.tweens.add({
            targets: this.purple,
            x: { from: game.config.width, to: -this.purple.width},
            ease: 'Sine.easeInOut',
            duration: 1000,
            repeat: 1,
            onRepeat: function() {
                this.pinkTween.duration -= 250;
            },
            onRepeatScope: this,
            onComplete: function() {
                this.purpleMiddleStopTween.play();
            },
            onCompleteScope: this
        });
        this.purpleMiddleStopTween = this.tweens.add({
            targets: this.purple,
            x: { from: game.config.width, to: (game.config.width / 2)},
            ease: 'Quint.easeOut',
            duration: 2000,
            paused: true,
            onComplete: function() {
                this.titleTween.play();
                this.titleNameTween.play();
                this.throneTween.play();
            },
            onCompleteScope: this
        });
        this.titleTween = this.tweens.add({
            targets: this.turnip_title,
            alpha: {from: 0, to: 1},
            y: {from: this.turnip_title.y, to: this.turnip_title.y + 20},
            ease: 'Quad.easeInOut',
            duration: 2000,
            paused: true,
        });
        this.titleNameTween = this.tweens.add({
            targets: this.birth_of_a_made_man,
            alpha: {from: 0, to: 1},
            y: {from: this.birth_of_a_made_man.y, to: this.birth_of_a_made_man.y + 20},
            ease: 'Quad.easeInOut',
            duration: 2000,
            paused: true,
        });
        this.throneTween = this.tweens.add({
            targets: this.turnip_throne,
            alpha: {from: 0, to: 1},
            y: {from: game.config.height + this.turnip_throne.height, to: 290},
            ease: 'Cubic.easeOut',
            duration: 3000,
            paused: true,
            onComplete: function() {
                this.throneLeftTween.play();
                this.titleLeftTween.play();
                this.titleNameLeftTween.play();
                this.pinkLeftTween.play();
                this.purpleLeftTween.play();
            },
            onCompleteScope: this
        });
        this.throneLeftTween = this.tweens.add({
            targets: this.turnip_throne,
            x: { from: this.turnip_throne.x, to: 180},
            ease: 'Sine.easeInOut',
            duration: 1250,
            //delay: 1000,
            paused: true,
        });
        this.titleLeftTween = this.tweens.add({
            targets: this.turnip_title,
            x: { from: this.turnip_title.x, to: 64},
            ease: 'Sine.easeInOut',
            duration: 1250,
            //delay: 1000,
            paused: true,
        });
        this.titleNameLeftTween = this.tweens.add({
            targets: this.birth_of_a_made_man,
            x: { from: this.birth_of_a_made_man.x, to: 420},
            ease: 'Sine.easeInOut',
            duration: 1250,
            //delay: 1000,
            paused: true,
        });
        this.pinkLeftTween = this.tweens.add({
            targets: this.pink,
            x: { from: (game.config.width / 2) - this.pink.width, to: 0},
            ease: 'Sine.easeInOut',
            duration: 1250,
            //delay: 1000,
            paused: true,
        });
        this.purpleLeftTween = this.tweens.add({
            targets: this.purple,
            x: { from: (game.config.width / 2), to: this.purple.width},
            ease: 'Sine.easeInOut',
            duration: 1250,
            //delay: 1000,
            paused: true,
            onComplete: function() {
                this.aGameByTween.play();
            },
            onCompleteScope: this
        });
        this.aGameByTween = this.tweens.add({
            targets: this.a_game_by,
            alpha: {from: 0, to: 1},
            y: {from: this.a_game_by.y, to: this.a_game_by.y + 20},
            ease: 'Sine.easeInOut',
            duration: 1500,
            paused: true,
            onComplete: function() {
                this.alexTween.play();
            },
            onCompleteScope: this
        });
        this.alexTween = this.tweens.add({
            targets: this.alex_robert,
            alpha: {from: 0, to: 1},
            ease: 'Sine.easeInOut',
            duration: 500,
            paused: true,
            onComplete: function() {
                this.fionaTween.play();
            },
            onCompleteScope: this
        });
        this.fionaTween = this.tweens.add({
            targets: this.fiona_hsu,
            alpha: {from: 0, to: 1},
            ease: 'Sine.easeInOut',
            duration: 500,
            paused: true,
            onComplete: function() {
                this.theaTween.play();
            },
            onCompleteScope: this
        });
        this.theaTween = this.tweens.add({
            targets: this.thea_gamez,
            alpha: {from: 0, to: 1},
            ease: 'Sine.easeInOut',
            duration: 500,
            paused: true,
            onComplete: function() {
                this.startTween.play();
                this.instructionsTween.play();
                this.creditsTween.play();
            },
            onCompleteScope: this
        });
        this.startTween = this.tweens.add({
            targets: this.buttonStart,
            x: {from: game.config.width + this.buttonStart.width, to: game.config.width - this.buttonStart.width},
            ease: 'Sine.easeOut',
            duration: 500,
            paused: true,
        });
        this.instructionsTween = this.tweens.add({
            targets: this.buttonInstructions,
            x: {from: game.config.width + this.buttonInstructions.width, to: game.config.width - this.buttonInstructions.width},
            ease: 'Sine.easeOut',
            duration: 500,
            paused: true,
        });
        this.creditsTween = this.tweens.add({
            targets: this.buttonCredits,
            x: {from: game.config.width + this.buttonCredits.width, to: game.config.width - this.buttonCredits.width},
            ease: 'Sine.easeOut',
            duration: 500,
            paused: true,
            onComplete: function() {
                this.initializeButtons();
            },
            onCompleteScope: this
        });
        

    }
}