import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import 'phaser/plugins/spine/dist/SpinePlugin';

const ratio = Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
const DEFAULT_HEIGHT = 756 // any height you want
const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#1c1c1c',
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
            fps: 60,
            fixedStep: true,
            overlapBias: 64,
        },
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ],
    plugins: {
        scene: [
            {
                key: 'SpinePlugin',
                plugin: window.SpinePlugin,
                mapping: 'spine'
            }
        ]
    },
    audio: {
        disableWebAudio: true,
    }
};

const StartGame = (parent: string) => {

    const game = new Game({ ...config, parent });
    return game;
}

export default StartGame;
