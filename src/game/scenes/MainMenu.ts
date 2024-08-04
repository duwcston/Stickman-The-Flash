import { Scene } from "phaser";
import { Player } from "../sprites/Player";

export class MainMenu extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    ground: Phaser.GameObjects.Image;
    player: Player;

    constructor() {
        super({ key: "MainMenu" });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.camera = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(1);
        overlay.alpha = 0;

        // Fade in the overlay
        this.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 2000,
            ease: 'Power2'
        });

        this.background = this.add.image(width / 2, height / 2, 'background');
        this.background.setAlpha(0.8);

        this.ground = this.physics.add.image(width / 2, height - 45, 'ground')
            .setScale(1.8)
            .setImmovable(true)
            .refreshBody();

        this.player = new Player(this, this.ground);

        const startButton = this.add.text(width / 2, height / 2 - 50, 'Press ANY button to start', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive().setDepth(2);

        // Adding tween to the startButton
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
}