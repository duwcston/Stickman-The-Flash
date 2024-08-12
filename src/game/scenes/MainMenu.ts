import { Scene } from "phaser";
import { Player } from "../sprites/Player";

export class MainMenu extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    moon: Phaser.GameObjects.TileSprite;
    citybg: Phaser.GameObjects.TileSprite;
    city: Phaser.GameObjects.TileSprite;
    road: Phaser.GameObjects.Image;
    player: Player;

    constructor() {
        super({ key: "MainMenu" });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.camera = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(1);
        overlay.alpha = 0;

        this.tweens.add({
            targets: overlay,
            alpha: 0.5,
            duration: 2000,
            ease: 'Power2'
        });

        this.moon = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'moon').setScale(1.5);
        this.citybg = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'citybg').setScale(1.5);
        this.city = this.add.tileSprite(width as number / 2, height as number / 2, 0, 0, 'city').setScale(1.5);

        this.road = this.physics.add.image(width as number / 2, height as number / 2 + 100, 'road')
            .setSize(width as number, 100)
            .setOffset(0, height as number / 2 + 80)
            .setImmovable(true)
            .refreshBody();

        this.player = new Player(this, this.road);

        const startButton = this.add.text(width / 2, height / 2 - 50, 'Press ANY button to start', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive().setDepth(2);

        this.tweens.add({
            targets: startButton,
            alpha: 0,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard?.on("keydown", () => {
            this.scene.start("Game");
        });

        startButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    update(): void {
        this.citybg.tilePositionX += 0.3;
        this.city.tilePositionX += 0.5;
    }
}