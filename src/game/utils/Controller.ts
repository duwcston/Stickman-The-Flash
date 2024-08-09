import { Player } from "../sprites/Player";

export class Controller {
    scene: Phaser.Scene;
    player: Player;
    road: Phaser.GameObjects.Image;
    flashable: boolean = true;

    constructor(scene: Phaser.Scene, player: Player, road: Phaser.GameObjects.Image) {
        this.scene = scene;
        this.player = player;
        this.road = road;
        this.scene.input.on('pointerdown', this._flash, this);
    }

    private _flash(pointer: Phaser.Input.Pointer) {
        const anims = ['dash_attack', 'attack_dam', 'da'];
        if (this.flashable) {
            // Destroy the current Spine player and recreate it at the pointer's location
            this.player.player.destroy();
            this.player.createPlayer(pointer.worldX, pointer.worldY);

            // Flip the player horizontally if the pointer is on the left side of the screen
            if (pointer.x < this.scene.scale.width / 2) {
                this.player.player.scaleX = -0.1;
                this.player.player.scaleY = 0.1;
            }

            // Set the Spine animation to 'dash_attack'
            this.player.player.setAnimation(0, Phaser.Utils.Array.GetRandom(anims), false);
            this.player.swordHitbox.body.enable = true;
            this.scene.physics.world.add(this.player.swordHitbox.body);

            this.player.player.state.addListener({
                event: () => { },
                start: () => { },
                interrupt: () => { },
                end: () => { },
                dispose: () => { },
                complete: (entry: spine.TrackEntry) => {
                    if (anims.includes(entry.animation.name)) {
                        this.player.player.setAnimation(0, 'idle', true);
                        this.player.swordHitbox.body.enable = false;
                        this.scene.physics.world.remove(this.player.swordHitbox.body);
                    }
                }
            });
        }
    }

    public flashOff(pointer: Phaser.Input.Pointer) {
        if (pointer.y > this.scene.scale.height - 80) {
            this.flashable = false;
        }
        else {
            this.flashable = true;
        }
    }
}