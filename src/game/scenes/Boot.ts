import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('moon', 'assets/moon.png');
        this.load.image('citybg', 'assets/citybg.png');
        this.load.image('city', 'assets/city.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
