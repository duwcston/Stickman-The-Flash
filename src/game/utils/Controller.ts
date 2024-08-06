import { Player } from "../sprites/Player";

export class Controller {
    scene: Phaser.Scene;
    player: Player;
    ground: Phaser.GameObjects.Image;
    flashable: boolean = true;

    constructor(scene: Phaser.Scene, player: Player, ground: Phaser.GameObjects.Image) {
        this.scene = scene;
        this.player = player;
        this.ground = ground;
        this.scene.input.on('pointerdown', this._flash, this);
    }

    private _flash(pointer: Phaser.Input.Pointer) {
        if (this.flashable) {
            this.player.player.destroy();
            this.player.createPlayer(pointer.worldX, pointer.worldY);
            if (pointer.x < this.scene.scale.width / 2) {
                this.player.player.flipX = true;
            }
            this.player.player.anims.play('attack');

            const startHit = (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
                if (frame.index < 10) {
                    return;
                }
                this.player.player.off(Phaser.Animations.Events.ANIMATION_UPDATE, startHit);

                this.player.swordHitbox.x = this.player.player.flipX
                    ? this.player.player.x - this.player.player.width / 3 + 5
                    : this.player.player.x + this.player.player.width / 3 - 5;

                this.player.swordHitbox.y = this.player.player.y + this.player.player.height / 4 - 5;

                this.player.swordHitbox.body.enable = true;
                this.scene.physics.world.add(this.player.swordHitbox.body);
            }
            this.player.player.on(Phaser.Animations.Events.ANIMATION_UPDATE, startHit);

            this.player.player.once('animationcomplete', () => {
                this.player.player.anims.play('idle');
                this.player.swordHitbox.body.enable = false;
                this.scene.physics.world.remove(this.player.swordHitbox.body);
            });
        }
    }

    public flashOff(pointer: Phaser.Input.Pointer) {
        if (pointer.y > this.scene.scale.height - this.ground.height * 2) {
            this.flashable = false;
        }
        else {
            this.flashable = true;
        }
    }
}