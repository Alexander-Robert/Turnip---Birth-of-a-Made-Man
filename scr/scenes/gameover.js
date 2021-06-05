class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }
    init(data) {
        this.stats = data;
        console.log(this.stats);
    }
    create() {
        //text configuration
        let titleTextConfig = {
            fontFamily: 'font1',
            fontSize: '48px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 300, useAdvancedWrap: true },
            padding: {
                top: 5,
                bottom: 5,
            },
        }
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

        this.gamePlayImage = this.add.image(0, 0, 'titlesnapshot').setOrigin(0).setDepth(99);
        this.shop = this.add.sprite(0, 736, "shopUI").setOrigin(0).setDepth(this.gamePlayImage.depth + 1);
        this.shop.alpha = 0;
        this.buttons = [];
        this.buttonHome = this.add.sprite(10, 748, 'home', 0).setOrigin(0).setFlipX(true).setDepth(100);
        this.buttonHome.alpha = 0;
        this.buttonRestart = this.add.sprite(190, 748, 'restart', 0).setOrigin(0).setDepth(100);
        this.buttonRestart.alpha = 0;
        this.buttons.push(this.buttonHome, this.buttonRestart);
        this.menuClicked = false;
        this.restartClicked = false;
        this.initializeButtons();

        this.titleText = this.add.text(510, 775,
            `title: ${this.stats.title}`, titleTextConfig).setOrigin(0.5).setDepth(this.shop.depth + 1);
        this.titleText.alpha = 0;
        this.escapeText = this.add.text(750, 820,
            `times escaped: ${this.stats.escaped}`, titleTextConfig).setOrigin(0.5).setDepth(this.shop.depth + 1);
        this.escapeText.alpha = 0;
        this.cropsText = this.add.text(1100, 810,
            `total crops: ${this.stats.totalCrops}`, titleTextConfig).setOrigin(0.5).setDepth(this.shop.depth + 1);
        this.cropsText.alpha = 0;
        this.scoreText = this.add.text(1290, 755, "Reputation " + this.stats.score, pointsTextConfig).setDepth(this.shop.depth + 1);

        this.titleTween = this.tweens.add({
            targets: [this.shop, this.buttonHome, this.buttonRestart, this.titleText, this.escapeText, this.cropsText],
            alpha: {from: 0, to: 1},
            ease: 'Quad.easeInOut',
            duration: 2000
        });
    }
    update() {
        if (this.restartClicked) {
            this.scene.start("playScene");
        }
        if (this.menuClicked) {
            this.scene.start("menuScene", [false]);
        }
    }

    initializeButtons() {
        //define specific button click methods
        //function requires us to pass the wrapper(i.e. the scene) of the tutorial property
        //because Javascript does not pass by reference!
        this.buttonHome.click = function (scene) {
            scene.menuClicked = true;
        };
        this.buttonRestart.click = function (scene) {
            scene.restartClicked = true;
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