/*
Collaborators:
Alexander Robert
Thea Gamez
Fiona Hsu
Game title: Turnip - Birth of a Made Man
Date completed:
*/

//define main game object
let config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 1280,
    height: 736,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x:0,
                y:0
            }
        }
    },
    scene: [Load, Menu, Play],
}
let game = new Phaser.Game(config);