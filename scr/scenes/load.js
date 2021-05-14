class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("turnip", "turnip.png");
        this.load.image("field_set", "tileset.png");
        this.load.tilemapTiledJSON("field_test", "field_test.json");
    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}