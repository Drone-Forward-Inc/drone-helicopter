var game;
var gameOptions = {


    droneGravity: 800,

    droneSpeed: 380,

    droneFlapPower: 250,

    minCopterHeight: 90,

    copterDistance: [200, 250],

    copterHole:[100, 150],

    localStorageName: 'bestFlappyScore'
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: 600,
            height: 480
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: playGame,
    }

    game = new Phaser.Game(gameConfig);
    window.focus();
}

class playGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }
    preload() {
        this.load.image('sky', 'sky.png');
        this.load.image('drone', 'drone.png');
        this.load.image('copter', 'copter.png');
    }
    create() {
        this.add.image(400, 300, 'sky');
        this.copterGroup = this.physics.add.group();
        this.copterPool = [];
        for(let i = 0; i < 10; i++){
            this.copterPool.push(this.copterGroup.create(0, 0, 'copter'));
            this.copterPool.push(this.copterGroup.create(0, 0, 'copter'));
            this.placeCopters(false);
        }
        this.copterGroup.setVelocityX(-400);
        this.drone = this.physics.add.sprite(80, game.config.height / 2, 'drone');
        this.drone.body.gravity.y = gameOptions.droneGravity;
        this.input.on('pointerdown', this.flap, this);
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(0, 0, '');
        this.updateScore(this.score);
    }
    updateScore(inc) {
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }
    placeCopters(addScore) {
        let rightmost = this.getRightmostCopter();
        let copterHoleHeight = Phaser.Math.Between(gameOptions.copterHole[1], gameOptions.copterHole[1]);
        let copterHolePosition = Phaser.Math.Between(gameOptions.minCopterHeight + copterHoleHeight / 2, game.config.height - gameOptions.minCopterHeight - copterHoleHeight / 2);
        this.copterPool[0].x = rightmost + this.copterPool[0].getBounds().width + Phaser.Math.Between(gameOptions.copterDistance[0], gameOptions.copterDistance[1]);
        this.copterPool[0].y = copterHolePosition - copterHoleHeight / 1;
        this.copterPool[0].setOrigin(0, 0);
        this.copterPool[1].x = this.copterPool[0].x;
        this.copterPool[1].y = copterHolePosition + copterHoleHeight / 4;
        this.copterPool[1].setOrigin(0, 0);
        this.copterPool = [];
        if(addScore){
            this.updateScore(1);
        }
    }
    flap() {
        this.drone.body.velocity.y = -gameOptions.droneFlapPower;
    }
    getRightmostCopter() {
        let rightmostCopter = 0;
        this.copterGroup.getChildren().map((copter) => {
            rightmostCopter = Math.max(rightmostCopter, copter.x);
        });
        return rightmostCopter;
    }
    update() {
        this.physics.world.collide(this.drone, this.copterGroup, () => {
            this.die();
        }, null, this);
        if(this.drone.y > game.config.height || this.drone.y < 0){
            this.die();
        }
        this.copterGroup.getChildren().map((copter) => {
            if(copter.getBounds().right < 0){
                this.copterPool.push(copter);
                if(this.copterPool.length == 2){
                    this.placeCopters(true);
                }
            }
        }, this)
    }
    die() {
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
        this.scene.start('PlayGame');
    }
}
