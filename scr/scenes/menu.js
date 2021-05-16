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
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }

        //TODO: change this to be clickable button.
        this.scoreText = this.add.text(1280/2,736/2, "Press B to start", textConfig);
        this.Bkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

        
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.Bkey)) {
            this.scene.start("playScene");
        }
    }
}