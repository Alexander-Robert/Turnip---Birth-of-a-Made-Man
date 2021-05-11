class Play extends Phaser.Scene {
    constructor () {
        super("playScene");
    }
    create() {
        console.log("created playScene!");
        this.turnip = this.add.sprite(game.config.width/2, game.config.height/2, "turnip");
    }
}