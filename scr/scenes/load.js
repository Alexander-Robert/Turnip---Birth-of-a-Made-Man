class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("turnip", "turnip.png");
    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}