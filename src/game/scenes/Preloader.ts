import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    init() {
        const { width, height } = this.sys.game.config;

        this.add.image(width as number / 2, height as number / 2, 'moon').setScale(2.5, 1.5);
        this.add.image(width as number / 2, height as number / 2, 'citybg').setScale(2.5, 1.5);
        this.add.image(width as number / 2, height as number / 2, 'city').setScale(2.5, 1.5);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(width as number / 2, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(width as number / 2 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('road', 'road.png');

        //  Load the Spine animation data
        this.load.spine('spiderman', 'spine/spider_man_epic1.json', 'spine/spider_man_epic1.atlas');
        this.load.spine('enemy', 'spine/enemy1.json', 'spine/enemy1.atlas');

        // Load the audio assets
        this.load.audio('theme', 'audio/funky-loop-40283.mp3');
        this.load.audio('swoosh', 'audio/swoosh.mp3');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
