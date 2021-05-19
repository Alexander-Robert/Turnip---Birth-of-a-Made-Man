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
        this.load.spritesheet("object_set", "objects.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.tilemapTiledJSON("field_test", "field_new.json");
        this.load.tilemapTiledJSON("field_test", "field_test.json");

        this.load.audio("running", "running.wav");
        this.load.audio("harvest", "rustle.ogg");
    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}