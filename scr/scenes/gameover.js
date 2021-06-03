class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }
    init(data) {
        this.stats = data;
        console.log(this.stats);
    }
    create() {
        console.log("created gameOverScene!");
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
        this.scoreText = this.add.text(game.config.width / 4, game.config.height / 2, 
            `Press r to replay
            space to go back to menu`, textConfig).setOrigin(0.5);
        this.scoreText = this.add.text(game.config.width / 2, game.config.height / 2, 
            `title ${this.stats.title}
            reputation ${this.stats.score}
            crops ${this.stats.totalCrops}
            escapes ${this.stats.escaped}
            `, textConfig).setOrigin(0.5);
        this.SPACEKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.Rkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.scene.start("playScene");
        }
        else if (Phaser.Input.Keyboard.JustDown(this.SPACEKey)) {
            this.scene.start("menuScene");
        }
    }
}