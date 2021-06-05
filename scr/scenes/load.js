class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("turnip", "turnipLarge.png");
        this.load.image("hole", "hole.png");
        this.load.image("covered hole", "covered hole.png");
        this.load.image("farmer", "farmer.png");
        this.load.image("tower", "tower.png");
        this.load.image("bag", "bag.png");
        this.load.image("shopUI", "shopUI.png");
        this.load.image("pescotti", "pescotti.png");
        this.load.image("field_set", "tileset.png");

        this.load.atlas('warning', 'warning.png',
            'warning.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('question', 'question.png',
            'question.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

        this.load.audio("running", "running.wav");
        this.load.audio("harvest", "rustle.ogg");
        this.load.audio("dig", "dig.wav");
        this.load.audio("sell", "cha-ching.wav");
        this.load.audio("ocean_waves", "ocean_waves.wav");
        this.load.audio("music", "melodie.mp3");

        this.load.spritesheet("object_set", "objects.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.tilemapTiledJSON("field_test", "field_new.json");
    }
    create() {
        console.log("created loadScene!");
        this.scene.start("menuScene");
    }
}