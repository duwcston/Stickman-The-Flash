import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add a semi-transparent black overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1);
        overlay.alpha = 1;

        // Fade in the overlay
        this.tweens.add({
            targets: overlay,
            alpha: 0.3,
            duration: 2000,
            ease: 'Power2'
        });

        // Display "Game Over" text
        this.add.text(width / 2, height / 2 - 50, 'Game Over', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Display "Restart" button
        const restartButton = this.add.text(width / 2, height / 2 + 10, 'Restart', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
