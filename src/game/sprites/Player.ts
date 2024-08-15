import { Enemy } from "./Enemy";
import { Boss } from "./Boss";
import { PLAYER_SCALE } from "../utils/Constant";

export class Player {
    scene: Phaser.Scene;
    player: SpineGameObject;
    road: Phaser.GameObjects.Image;
    hitbox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerHealthBar: Phaser.GameObjects.Graphics;
    creepOverlap: Phaser.Physics.Arcade.Collider;
    hitfx: Phaser.Sound.BaseSound;
    private static _instancePlayer: Player;

    private _enemyKilled: number;
    private _isTakingDamage: boolean;
    private _maxHealth: number = 500;
    private _health: number;
    private _playerDamage: number = 10;

    static get instancePlayer() {
        return Player._instancePlayer;
    }

    constructor(scene: Phaser.Scene, road: Phaser.GameObjects.Image) {
        Player._instancePlayer = this;

        this.scene = scene;
        this.road = road;
        this.createPlayer(this.scene.scale.width, this.scene.scale.height / 2 + 50);
        this.createHitbox();
        this._enemyKilled = 0;
        this.hitfx = this.scene.sound.add('hit', { volume: 0.5 });
        this._health = this._maxHealth
        this.playerHealthBar = this.scene.add.graphics();
    }

    get enemyKilled() {
        return this._enemyKilled;
    }

    get isTakingDamage() {
        return this._isTakingDamage;
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

    public set isTakingDamage(value: boolean) {
        this._isTakingDamage = value;
        if ((this._isTakingDamage) && (this._health > 0)) {
            this.player.setAnimation(0, 'hit', false);
            this.player.addAnimation(0, 'idle', true, 0);
            this.takeDamage(Enemy.instanceEnemy.enemyDamage);
        }
    }

    public createPlayer(x: number, y: number) {
        this.player = this.scene.add.spine(x, y, 'spiderman');
        this.player.setScale(PLAYER_SCALE);
        this.scene.physics.add.existing(this.player as unknown as Phaser.Physics.Arcade.Image);
        this.isTakingDamage = false;
        this.scene.physics.add.collider(this.player as unknown as Phaser.Physics.Arcade.Image, this.road, () => {
            this.player.addAnimation(0, 'idle', true, 0);
        });

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setGravityY(300);
        this.setPlayerStartAnimations();
    }

    private setPlayerStartAnimations() {
        // Set the initial animation
        this.player.setAnimation(0, 'dang_roi', true);
        this.player.addAnimation(0, 'dang_roi', false, 0);
        this.player.addAnimation(0, 'dap_dat', false, 0.75);
        this.player.addAnimation(0, 'idle', true, 0);
    }

    private createHitbox(): void {
        this.hitbox = this.scene.add.rectangle(0, 0, 50, 30, 0xffffff, 0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.scene.physics.add.existing(this.hitbox);
        this.hitbox.visible = false;
        this.hitbox.body.enable = false;
        this.scene.physics.world.remove(this.hitbox.body);
    }

    public updateHitbox() {
        // Update hitbox position based on player direction
        this.hitbox.x = this.player.scaleX < 0
            ? this.player.x - 42
            : this.player.x + 42;
        this.hitbox.y = this.player.y - 52;
    }

    public attackEnemy(): void {
        // console.log('Enemy count from player: ', Enemy.instanceEnemy.enemyGroup.countActive()); // Debugging
        this.creepOverlap = this.scene.physics.add.overlap(this.hitbox, Enemy.instanceEnemy.enemyGroup, this.killEnemy, undefined, this);
    }

    private killEnemy(_hitbox: Phaser.GameObjects.GameObject, enemy: SpineGameObject) {
        Enemy.instanceEnemy.enemyHealth -= this.playerDamage;
        this.hitfx.play();
        // console.log('Enemy health: ', Enemy.instanceEnemy.enemyHealth); // Debugging
        if (Enemy.instanceEnemy.enemyHealth <= 0) {
            this._enemyKilled++;
            console.log('Enemy killed: ', this._enemyKilled);
            Enemy.instanceEnemy.enemyGroup.remove(enemy as unknown as Phaser.Physics.Arcade.Sprite);
            const knockbackX = this.player.x < enemy.x ? 1000 : -1000;
            const knockbackY = -700;
            (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(knockbackX, knockbackY);

            enemy.setAnimation(0, 'die', false, true);
            this.scene.time.delayedCall(500, () => {
                enemy.destroy();
            })
        }
    }

    public createPlayerHealthBar() {
        const barWidth = 700;
        const barHeight = 15;
        const healthRatio = this.health / this.maxHealth;

        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0xff0000);
        this.playerHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth, barHeight).setScrollFactor(0);

        this.playerHealthBar.fillStyle(0x00ff00);
        this.playerHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth * healthRatio, barHeight).setScrollFactor(0);
    }

    private takeDamage(amount: number) {
        this._health = Phaser.Math.Clamp(this._health - amount, 0, this.maxHealth);
        this.createPlayerHealthBar();
    }

    public attackBoss() {
        this.creepOverlap.active = false;
        const attackAnims = ['dash_attack', 'attack_dam', 'attack_dam2', 'da', 'da2', 'boss_attack1', 'boss_attack2'];

        this.scene.physics.add.overlap(this.hitbox, Enemy.instanceEnemy.enemyGroup, () => {
            const currentTrackEntry = this.player.state.getCurrent(0);
            const currentAnimation = currentTrackEntry?.animation?.name;

            if (attackAnims.includes(currentAnimation)) {
                const hitEffect = this.scene.add.graphics();

                hitEffect.fillStyle(0x00ffff, 1);
                hitEffect.fillCircle(this.hitbox.x, this.hitbox.y, 10);
                this.hitfx.play();
                this.scene.tweens.add({
                    targets: hitEffect,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        hitEffect.destroy();
                    }
                });

                Boss.instanceBoss.bossIsTakingDamage = true;
                this.scene.time.delayedCall(100, () => {
                    Boss.instanceBoss.bossIsTakingDamage = false;
                });
            }
        }, undefined, this);
    }
}