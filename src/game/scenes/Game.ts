import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { Controller } from '../utils/Controller';
import { Spawner } from '../utils/Spawner';
import { Enemy } from '../sprites/Enemy';
import { Boss } from '../sprites/Boss';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    ground: Phaser.GameObjects.Image;
    player: Player;
    controller: Controller;
    enemy: Enemy;
    boss: Boss;
    spawner: Spawner;
    spawnTime: number = 5000;

    constructor() {
        super({ key: 'Game' });
    }

    create(): void {
        const { width, height } = this.sys.game.config;

        this.camera = this.cameras.main;
        this.camera.fadeIn(1000, 0, 0, 0);

        this.camera.setBounds(0, 0, width as number * 2, height as number);
        this.physics.world.bounds.width = width as number * 2;
        this.physics.world.bounds.height = height as number;

        this.background = this.add.image(width as number / 2, height as number / 2, 'background');
        this.background.setAlpha(0.8);

        this.ground = this.physics.add.staticImage(width as number / 2, height as number - 45, 'ground')
            .setScale(1.75)
            .setImmovable(true)
            .refreshBody();

        this.player = new Player(this, this.ground);

        this.camera.startFollow(this.player.player, true, 0.1, 0.1);
        this.camera.setFollowOffset(this.player.player.width, this.player.player.height);

        this.enemy = new Enemy(this, this.player, this.ground);
        this.boss = new Boss(this, this.player, this.ground);

        this.spawner = new Spawner(this, this.enemy, this.boss);
        this.spawner.spawnEnemy(this.spawnTime);

        this.controller = new Controller(this, this.player, this.ground);

        this.player.attackEnemy();

        EventBus.emit('current-scene-ready', this);
    }

    update(): void {
        this.controller.flashOff(this.input.activePointer);

        if (this.player.health <= 0 || this.boss.bossIsKilled) {
            this.handleGameOver();
        }
    }

    handleGameOver(): void {
        this.scene.pause('Game');
        this.scene.run('GameOver');
    }
}