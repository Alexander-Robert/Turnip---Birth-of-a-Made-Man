class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }
    preload() {
        this.load.path = "./assets/";
        //turnip assets //NOTE: space is idle image, _ is atlas
        this.load.image("turnip up",    "/turnip/turnip back.png");
        this.load.image("turnip down",  "/turnip/turnip fwd.png");
        this.load.image("turnip left",  "/turnip/turnip left.png");
        this.load.image("turnip right", "/turnip/turnip right.png");
        this.load.atlas('turnip_up', '/turnip/turnip_up.png', '/turnip/turnip_up.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('turnip_down', '/turnip/turnip_down.png', '/turnip/turnip_down.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('turnip_left', '/turnip/turnip_left.png', '/turnip/turnip_left.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('turnip_right', '/turnip/turnip_right.png', '/turnip/turnip_right.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('turnip_enter', '/turnip/turnip_enter.png', '/turnip/turnip_enter.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('turnip_exit', '/turnip/turnip_exit.png', '/turnip/turnip_exit.json',
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        
        //farmer assets //NOTE: space is idle image, _ is atlas
        this.load.image("farmer up",    "/farmer/farmer back.png");
        this.load.image("farmer down",  "/farmer/farmer fwd.png");
        this.load.image("farmer left",  "/farmer/farmer left.png");
        this.load.image("farmer right", "/farmer/farmer right.png");
        this.load.atlas('farmer_up', '/farmer/farmer_up.png', '/farmer/farmer_up.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('farmer_down', '/farmer/farmer_down.png', '/farmer/farmer_down.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('farmer_left', '/farmer/farmer_left.png', '/farmer/farmer_left.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('farmer_right', '/farmer/farmer_right.png', '/farmer/farmer_right.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('warning', '/farmer/warning.png', '/farmer/warning.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('question', '/farmer/question.png', '/farmer/question.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        //pescotti assests
        this.load.image("pescotti pool", "/pescotti/pescotti_pool.png");
        this.load.image("pescotti sale", "/pescotti/pescotti_sale.png");
        this.load.atlas('poof', '/pescotti/poof.png', '/pescotti/poof.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        this.load.atlas('bagbear', '/pescotti/bagbear.png', '/pescotti/bagbear.json', 
                        Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        //other UI assets
        this.load.image("hole", "hole.png");
        this.load.image("covered hole", "covered hole.png");
        this.load.image("light house", "lighthouse_wbackground.png");
        this.load.image("bag", "bag.png");
        this.load.image("shopUI", "shopUI.png");
        this.load.image("field_set", "tileset.png");
        this.load.image("star", "star.png");

        //scene images
        this.load.image("win-screen", "win-screen.png");

        //audio
        this.load.audio("running", "running.wav");
        this.load.audio("harvest", "rustle.ogg");

        //tilemap assets
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