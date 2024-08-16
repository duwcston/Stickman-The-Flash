import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { Controller } from '../utils/Controller';
import { Spawner } from '../utils/Spawner';
import { Enemy } from '../sprites/Enemy';
import { Boss } from '../sprites/Boss';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    theme: Phaser.Sound.BaseSound;
    moon: Phaser.GameObjects.TileSprite;
    citybg: Phaser.GameObjects.TileSprite;
    city: Phaser.GameObjects.TileSprite;
    road: Phaser.GameObjects.Image;
    // road: Phaser.GameObjects.TileSprite;
    player: Player;
    controller: Controller;
    enemy: Enemy;
    boss: Boss;
    spawner: Spawner;
    spawnTime: number = 3000;

    constructor() {
        super({ key: 'Game' });
    }

    create(): void {
        const { width, height } = this.sys.game.config;

        this.camera = this.cameras.main;
        this.camera.fadeIn(1000, 0, 0, 0);
        this.camera.setBounds(0, 0, width as number * 2, height as number);
        this.physics.world.setBounds(0, 0, width as number * 2, height as number);
        this.physics.world.fixedStep = true;

        this.theme = this.sound.add('theme', { loop: true, volume: 0.5 });
        this.theme.play();

        this.moon = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'moon')
            .setScale(2.5, 1.5)
            .setScrollFactor(0);
        this.citybg = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'citybg')
            .setScale(2.5, 1.5)
            .setScrollFactor(0);
        this.city = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'city')
            .setScale(2.5, 1.5)
            .setScrollFactor(0);

        this.road = this.physics.add.image(width as number, height as number / 2 + 100, 'road')
            .setScale(4.5, 1)
            .setScrollFactor(1)
            .setSize(width as number * 2, 100)
            .setOffset(0, height as number / 2 + 90)
            .setImmovable(true)
            .refreshBody();

        this.player = new Player(this, this.road);
        this.player.createPlayerHealthBar();

        this.camera.centerOn(this.player.player.x, this.player.player.y);

        this.enemy = new Enemy(this, this.player, this.road);
        this.boss = new Boss(this, this.player, this.road);

        this.spawner = new Spawner(this, this.enemy, this.boss);
        this.spawner.spawnEnemy(this.spawnTime);

        this.controller = new Controller(this, this.player, this.road);

        this.player.attackEnemy();

        EventBus.emit('current-scene-ready', this);
    }

    update(): void {
        this.citybg.tilePositionX += 0.3;
        this.city.tilePositionX += 0.5;

        this.camera.pan(this.player.player.x, this.player.player.y, 3000, 'Power2', true);

        this.player.updateHitbox();
        this.controller.flashOff(this.input.activePointer);

        if (this.player.health <= 0) {
            this.enemy.enemyGroup.clear(true, true);
            this.player.player.timeScale = 0.35;
            this.player.player.setAnimation(0, 'die', false, true);
            this.camera.zoomTo(2.5, 2400);
            this.time.addEvent({
                delay: 2700,
                callback: () => {
                    this.handleGameOver();
                },
                callbackScope: this
            });
        }

        if (Boss.instanceBoss.bossIsKilled) {
            this.boss.enemy.timeScale = 0.35;
            this.boss.enemy.setAnimation(0, 'die', false, true);
            this.camera.zoomTo(2.5, 2400);
            this.time.addEvent({
                delay: 2700,
                callback: () => {
                    this.theme.stop();
                    this.scene.pause('Game');
                    this.scene.run('GameOver');
                },
                callbackScope: this
            });
        }
    }

    private handleGameOver(): void {
        this.theme.stop();
        this.scene.pause('Game');
        this.scene.run('GameOver');
    }
}