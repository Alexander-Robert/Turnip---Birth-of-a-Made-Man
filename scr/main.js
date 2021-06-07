/*
Collaborators:
Alexander Robert
Thea Gamez
Fiona Hsu
Game title: Turnip - Birth of a Made Man
Date completed: 6/7/2021
*/

//define main game object
let config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 1600,
    height: 886,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
            gravity: {
                x:0,
                y:0
            }
        }
    },
    scene: [Load, Menu, Play, GameOver],
}
let game = new Phaser.Game(config);

const TILE_SIZE = 32;