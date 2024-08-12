import { Player } from "../sprites/Player";
import { PLAYER_SCALE } from "./Constant";

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
        const anims = ['dash_attack', 'attack_dam', 'attack_dam2', 'da', 'da2'];
        if (this.flashable) {
            this.player.player.destroy();
            this.player.createPlayer(pointer.worldX, pointer.worldY);
            if (pointer.x < this.scene.scale.width / 2) {
                this.flipPlayer(this.player.player, true);
            }

            // Set the Spine animation to 'dash_attack'
            this.player.player.setAnimation(0, Phaser.Utils.Array.GetRandom(anims), false);
            this.player.hitbox.body.enable = true;
            this.scene.physics.world.add(this.player.hitbox.body);

            this.player.player.state.addListener({
                event: () => { },
                start: () => { },
                interrupt: () => { },
                end: () => { },
                dispose: () => { },
                complete: (entry: spine.TrackEntry) => {
                    if (anims.includes(entry.animation.name)) {
                        this.player.player.setAnimation(0, 'idle', true);
                        this.player.hitbox.body.enable = false;
                        this.scene.physics.world.remove(this.player.hitbox.body);
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

    private flipPlayer(spine: SpineGameObject, flip: boolean) {
        let body = spine.body as Phaser.Physics.Arcade.Body;
        body.setSize(spine.width, spine.height);
        spine.scaleX = flip ? -PLAYER_SCALE : PLAYER_SCALE;

        if (flip) {
            body.setOffset(spine.width - body.width, body.offset.y);
        }
        else {
            body.setOffset(0, body.offset.y);
        }
    }
}