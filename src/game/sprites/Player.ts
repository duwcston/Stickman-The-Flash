import { Enemy } from "./Enemy";
import { Boss } from "./Boss";
import { PLAYER_SCALE } from "../enums/Constant";

export class Player {
    scene: Phaser.Scene;
    player: SpineGameObject;
    road: Phaser.GameObjects.Image;
    hitbox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerHealthBar: Phaser.GameObjects.Graphics;
    creepOverlap: Phaser.Physics.Arcade.Collider;
    private static _instancePlayer: Player;

    private _enemyKilled: number = 0;
    private _isTakingDamage: boolean = false;
    private _maxHealth: number = 500;
    private _health: number = this._maxHealth;
    private _playerDamage: number = 10;

    static get instancePlayer() {
        return Player._instancePlayer;
    }

    constructor(scene: Phaser.Scene, road: Phaser.GameObjects.Image) {
        Player._instancePlayer = this;

        this.scene = scene;
        this.road = road;
        this.playerHealthBar = this.scene.add.graphics();

        this.createPlayer(this.scene.scale.width, this.scene.scale.height / 2 + 50);
        this.createHitbox();
    }

    get enemyKilled() {
        return this._enemyKilled;
    }

    get isTakingDamage() {
        return this._isTakingDamage;
    }

    set isTakingDamage(value: boolean) {
        this._isTakingDamage = value;
        if (value && this._health > 0) {
            this.player.setAnimation(0, 'hit', false);
            this.player.addAnimation(0, 'idle', true, 0);
            this.takeDamage(Enemy.instanceEnemy.enemyDamage);
        }
    }

    get maxHealth() {
        return this._maxHealth;
    }

    get health() {
        return this._health;
    }

    get playerDamage() {
        return this._playerDamage;
    }

    public createPlayer(x: number, y: number) {
        this.player = this.scene.add.spine(x, y, 'spiderman');
        this.player.setScale(PLAYER_SCALE);
        this.scene.physics.add.existing(this.player as unknown as Phaser.Physics.Arcade.Image);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setGravityY(300);

        this.scene.physics.add.collider(this.player as unknown as Phaser.Physics.Arcade.Image, this.road, () => {
            this.player.addAnimation(0, 'idle', true, 0);
        });

        this.setPlayerStartAnimations();
    }

    private setPlayerStartAnimations() {
        this.player.setAnimation(0, 'dang_roi', true);
        this.player.addAnimation(0, 'dang_roi', false, 0);
        this.player.addAnimation(0, 'dap_dat', false, 0.75);
        this.player.addAnimation(0, 'idle', true, 0);
    }

    private createHitbox() {
        this.hitbox = this.scene.add.rectangle(0, 0, 60, 30, 0xffffff, 0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.scene.physics.add.existing(this.hitbox);
        this.hitbox.visible = false;
        this.hitbox.body.enable = false;
        this.scene.physics.world.remove(this.hitbox.body);
    }

    public updateHitbox() {
        this.hitbox.setPosition(
            this.player.scaleX < 0 ? this.player.x - 42 : this.player.x + 42,
            this.player.y - 55
        );
    }

    public attackEnemy() {
        this.creepOverlap = this.scene.physics.add.overlap(this.hitbox, Enemy.instanceEnemy.enemyGroup, this.killEnemy, undefined, this);
    }

    private killEnemy(_hitbox: Phaser.GameObjects.GameObject, enemy: SpineGameObject) {
        const enemyInstance = Enemy.instanceEnemy;

        enemyInstance.enemyHealth -= this._playerDamage;

        if (enemyInstance.enemyHealth <= 0) {
            this._enemyKilled++;
            console.log('Enemy killed:', this._enemyKilled);

            enemyInstance.enemyGroup.remove(enemy as unknown as Phaser.Physics.Arcade.Sprite);

            const knockbackX = this.player.x < enemy.x ? 1000 : -1000;
            const knockbackY = -700;
            (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(knockbackX, knockbackY);

            enemy.setAnimation(0, 'die', false, true);
            this.scene.time.delayedCall(400, () => enemy.destroy());
        }
    }

    public createPlayerHealthBar() {
        const barWidth = 700;
        const barHeight = 15;
        const healthRatio = this._health / this._maxHealth;

        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0xff0000).fillRect(this.scene.scale.width / 2 - barWidth / 2, barHeight, barWidth, barHeight).setScrollFactor(0);
        this.playerHealthBar.fillStyle(0x00ff00).fillRect(this.scene.scale.width / 2 - barWidth / 2, barHeight, barWidth * healthRatio, barHeight).setScrollFactor(0);
    }

    private takeDamage(amount: number) {
        this._health = Phaser.Math.Clamp(this._health - amount, 0, this._maxHealth);
        this.createPlayerHealthBar();
    }

    public attackBoss() {
        this.creepOverlap.active = false;
        const attackAnims = ['dash_attack', 'attack_dam', 'attack_dam2', 'da', 'da2', 'boss_attack1', 'boss_attack2'];

        this.scene.physics.add.overlap(this.hitbox, Enemy.instanceEnemy.enemyGroup, () => {
            const currentTrackEntry = this.player.state.getCurrent(0);
            const currentAnimation = currentTrackEntry?.animation?.name;

            if (attackAnims.includes(currentAnimation)) {
                this.showHitEffect();
                Boss.instanceBoss.bossIsTakingDamage = true;
                this.scene.time.delayedCall(100, () => {
                    Boss.instanceBoss.bossIsTakingDamage = false;
                });
            }
        }, undefined, this);
    }

    private showHitEffect() {
        const hitEffect = this.scene.add.graphics();

        hitEffect.fillStyle(0x00ffff, 1).fillCircle(this.hitbox.x, this.hitbox.y, 5);
        hitEffect.fillStyle(0x24a3ff, 0.5).fillCircle(this.hitbox.x, this.hitbox.y, 10);

        this.scene.tweens.add({
            targets: hitEffect,
            alpha: 0,
            duration: 200,
            onComplete: () => hitEffect.destroy()
        });
    }
}
