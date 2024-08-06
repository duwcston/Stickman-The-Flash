import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        this.load.image('moon', 'assets/moon.png');
        this.load.image('city', 'assets/city.png');
        this.load.image('citybg', 'assets/citybg.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
