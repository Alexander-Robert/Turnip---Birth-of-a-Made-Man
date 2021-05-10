class Load extends Phaser.Scene {
    constructor () {
        super("loadScene");
    }
    preload () {

    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}