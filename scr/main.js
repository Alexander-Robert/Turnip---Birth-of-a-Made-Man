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
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                x:0,
                y:0
            }
        }
    },
    scene: [Menu],
}
let game = new Phaser.Game(config);