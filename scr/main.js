/*
Collaborators:
Alexander Robert
Thea Gamez
Fiona Hsu
Game title: Turnip - Birth of a Made Man
Date completed: 6/7/2021
NOTE: comments are coded in a conological file dependant manner.
    (i.e. read the comments of a single file from line 1 to line n then move onto the next file)

I know the code isn't perfect as many things could be better abstracted into functions or class heirarchy
or have less things be hard coded for placement like the UI but overall I think this code is good 
for the scope of this assignment and it's timeframe
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
    //The best way to read comments are in this order of files
    //optionally look at state-machine, then turnip and/or farmer after reading play
    scene: [Load, Menu, Play, GameOver],
}
let game = new Phaser.Game(config);

const TILE_SIZE = 32;