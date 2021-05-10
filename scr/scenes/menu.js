class Menu extends Phaser.Scene {
    constructor () {
        super("menuScene");
    }
    create(){
        console.log("created menuScene!");
        this.scene.start("playScene");
    }
}