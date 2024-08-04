import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { Controller } from '../utils/Controller';
import { Enemy } from '../sprites/Enemy';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    ground: Phaser.GameObjects.Image;
    player: Player;
    enemy: Enemy;
    controller: Controller;
    spawnTime: number = 5000;

    constructor() {
        super({ key: 'Game' });
    }

    create(): void {
        const { width, height } = this.sys.game.config;

        this.camera = this.cameras.main;

        this.background = this.add.image(width as number / 2, height as number / 2, 'background');
        this.background.setAlpha(0.8);

        this.ground = this.physics.add.image(width as number / 2, height as number - 45, 'ground')
            .setScale(1.8)
            .setImmovable(true)
            .refreshBody();

        this.player = new Player(this, this.ground);

        this.enemy = new Enemy(this, this.player, this.ground);

        this.enemy.spawnEnemy(this.spawnTime);

        this.controller = new Controller(this, this.player, this.ground);

        EventBus.emit('current-scene-ready', this);
    }

    update(): void {
        this.controller.flashOff(this.input.activePointer);
        this.player.attackEnemy();
        this.enemy.enemyVsPlayer();

        if (this.player.health <= 0) {
            this.handleGameOver();
        }
    }

    handleGameOver(): void {
        this.scene.pause('Game');
        this.scene.run('GameOver');
    }
}
