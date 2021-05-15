class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("turnip", "turnipLarge.png");
        this.load.image("tower", "tower.png");
        this.load.image("shopUI", "shopUI.png");
        this.load.image("pescotti", "pescotti.png");
        this.load.image("field_set", "tileset.png");
        this.load.tilemapTiledJSON("field_test", "field_test.json");

        this.load.audio("running", "running.wav");
    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}