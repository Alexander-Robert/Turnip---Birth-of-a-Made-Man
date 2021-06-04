class Menu extends Phaser.Scene {
    constructor () {
        super("menuScene");
    }
    create(){
        console.log("created menuScene!");

        //text configuration
        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '48px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
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
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.SPACEKey)) {
            this.scene.start("playScene");
        }
        if(this.tutorial) {
            this.tutorialGroup.setVisible(1);
        }
        else {
            this.tutorialGroup.setVisible(0);
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