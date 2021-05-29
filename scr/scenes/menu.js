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

        //TODO: change this to be clickable button.
        this.scoreText = this.add.text(1280/2,736/2, "Press Space to start", textConfig).setOrigin(0.5);;
        this.SPACEKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.SPACEKey)) {
            this.scene.start("playScene");
        }
    }
}