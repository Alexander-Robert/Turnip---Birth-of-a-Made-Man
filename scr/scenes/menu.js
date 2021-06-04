class Menu extends Phaser.Scene {
    constructor () {
        super("menuScene");
    }
    create(){
        console.log("created menuScene!");

        //text configuration
        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '36px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            align: 'center',
        }

        this.scoreText = this.add.text(1280/2,736/2, "Press Space to start", textConfig).setOrigin(0.5);
        this.SPACEKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.tutorialGroup = this.add.group({});
        this.infoScreen = this.add.image(0,0, 'info-screen', 0).setOrigin(0);
        this.infoScreen.lastFrame = 9; //couldn't find phaser method to find final frame so it's hardcoded

        this.buttons = [];
        this.buttonInfo = this.add.sprite(32, 32, 'info button', 0).setOrigin(0);
        this.buttonExit = this.add.sprite(64, 32, 'exit button', 0).setOrigin(0);
        this.buttonLeftArrow = this.add.sprite(96, 32, 'arrow button', 0).setOrigin(0).setFlipX(true);
        this.buttonRightArrow = this.add.sprite(128, 32, 'arrow button', 0).setOrigin(0);
        this.buttons.push(this.buttonExit, this.buttonInfo, this.buttonLeftArrow, this.buttonRightArrow);
        this.initializeButtons();

        this.tutorialGroup.add(this.infoScreen);
        this.tutorialGroup.add(this.buttonExit);
        this.tutorialGroup.add(this.buttonLeftArrow);
        this.tutorialGroup.add(this.buttonRightArrow);
        this.tutorialGroup.setVisible(0);
        this.tutorial = false; //bool for displaying game info screen

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
            "The shopkeeper, Pescotti is glad to\n those precious crops off Turnip's hand", textConfig));
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
        if (Phaser.Input.Keyboard.JustDown(this.SPACEKey)) {
            this.scene.start("playScene");
        }
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
        this.buttonExit.click = function (scene) {
            scene.tutorial = false;
        };
        this.buttonInfo.click = function (scene) {
            scene.tutorial = true;
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
}