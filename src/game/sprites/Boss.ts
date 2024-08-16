import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { BOSS_ATTACK_RANGE, BOSS_SPEED, BOSS_SCALE } from "../enums/Constant";

export class Boss extends Enemy {
    bossComing: Phaser.Sound.BaseSound;
    private static _instanceBoss: Boss;
    private _bossDamage: number = 30;
    private _bossHealth: number;
    private _bossMaxHealth: number = 1000;
    private _bossHealthBar: Phaser.GameObjects.Graphics;
    private _bossIsTakingDamage: boolean;
    private _bossIsKilled: boolean;

    static get instanceBoss() {
        return Boss._instanceBoss;
    }

    constructor(scene: Phaser.Scene, player: Player, road: Phaser.GameObjects.Image) {
        super(scene, player, road);

        Boss._instanceBoss = this;
        this._bossHealth = this._bossMaxHealth;
        this._bossHealthBar = this.scene.add.graphics();
        this.bossComing = this.scene.sound.add('boss_coming', { volume: 0.3, loop: false, seek: 5 });
    }

    get bossDamage() {
        return this._bossDamage;
    }

    get bossHealth() {
        return this._bossHealth;
    }

    get bossMaxHealth() {
        return this._bossMaxHealth;
    }

    get bossIsTakingDamage() {
        return this._bossIsTakingDamage;
    }

    get bossIsKilled() {
        return this._bossIsKilled;
    }

    set bossHealthBar(value: Phaser.GameObjects.Graphics) {
        this._bossHealthBar = value;
    }

    set bossIsKilled(value: boolean) {
        this._bossIsKilled = value;
        if (this._bossIsKilled) {
            this.player.player.timeScale = 0.1;
            this._bossHealthBar.clear();
        }
    }

    public set bossIsTakingDamage(value: boolean) {
        this._bossIsTakingDamage = value;
        if ((this._bossIsTakingDamage) && (this._bossHealth > 0)) {
            this.bossTakeDamage(Player.instancePlayer.playerDamage);
        }
    }

    public spawnBoss() {
        this.createBossImage(this.scene.scale.width, 0);
        this.createBossHealthBar();
        Enemy.instanceEnemy.enemyDamage = this.bossDamage;
        Enemy.instanceEnemy.enemyHealth = this.bossMaxHealth;
        this.player.attackBoss();
    }

    protected createBossImage(x: number, y: number) {
        this.enemy = this.scene.add.spine(x, y, 'enemy');
        this.enemy.setScale(BOSS_SCALE);
        this.scene.physics.add.existing(this.enemy as unknown as Phaser.Physics.Arcade.Sprite);
        const enemyBody = this.enemy.body as Phaser.Physics.Arcade.Body;
        enemyBody.setGravityY(500);
        enemyBody.setCollideWorldBounds(true);
        enemyBody.checkCollision.left = false;
        enemyBody.checkCollision.right = false;
        this.scene.physics.add.collider(this.enemy as unknown as Phaser.Physics.Arcade.Sprite, this.road, () => {
            enemyBody.setVelocityY(0);
        });
        this.bossIsTakingDamage = false;
        this.bossFallingAnimation();

        this.scene.time.addEvent({
            delay: 2100,
            callback: () => {
                this.enemyVsPlayer();
            },
        });
    }

    private bossFallingAnimation() {
        // Set the initial animation
        this.enemy.setAnimation(0, 'dang_roi', true);
        this.player.player.setAnimation(0, 'boss_prepare_loop', true);
        this.enemy.addAnimation(0, 'dang_roi', false, 0);
        this.enemy.addAnimation(0, 'dap_dat', false, 1.15);
        this.enemy.addAnimation(0, 'dat_nut', false, 0.1);
        this.enemy.addAnimation(0, 'idle', true, 0);
        // this.bossComing.play();
    }

    protected enemyVsPlayer() {
        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                const enemies = this._enemyGroup.getChildren() as unknown as SpineGameObject[];
                enemies.forEach((enemy) => {
                    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.player.x, this.player.player.y);
                    if (this.bossHealth > 0) {
                        enemy.timeScale = 0.5;
                        if (distance <= BOSS_ATTACK_RANGE) {
                            this.attackPlayer(enemy);
                        } else {
                            const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
                            this.flipEnemy(enemy, enemyBody.velocity.x < 0);
                            this.chasePlayer(enemy, BOSS_SPEED);
                        }
                    }
                    else {

                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    protected attackPlayer(enemy: SpineGameObject) {
        (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 500);
        const enemyAttackAnims = ['attack_dap', 'attack_dap2'];
        const currentTrackEntry = enemy.state.getCurrent(0);
        const currentAnimation = currentTrackEntry?.animation?.name;

        if (!enemyAttackAnims.includes(currentAnimation)) {
            this.flipEnemy(this.enemy, this.enemy.x > this.player.player.x);
            enemy.state.setAnimation(0, Phaser.Utils.Array.GetRandom(enemyAttackAnims), false);
            enemy.state.addListener({
                event: () => { },
                start: () => { },
                interrupt: () => { },
                end: () => { },
                dispose: () => { },
                complete: (trackEntry) => {
                    if (enemyAttackAnims.includes(trackEntry.animation.name)) {
                        enemy.state.addAnimation(0, 'idle', true, 0);
                        this.player.isTakingDamage = true;
                        this.scene.time.delayedCall(50, () => {
                            this.player.isTakingDamage = false;
                        });
                    }
                }
            });
        }
    }

    protected chasePlayer(enemy: SpineGameObject, chaseSpeed: number) {
        this.scene.physics.moveToObject(enemy as unknown as Phaser.Physics.Arcade.Sprite, this.player.player, chaseSpeed);
        enemy.setAnimation(0, 'run', false, true);
    }

    private createBossHealthBar() {
        const barWidth = 700;
        const barHeight = 30;
        const healthRatio = this.bossHealth / this.bossMaxHealth;

        this._bossHealthBar.clear();
        this._bossHealthBar.fillStyle(0xff0000);
        this._bossHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 50 + barHeight, barWidth, barHeight).setScrollFactor(0);

        this._bossHealthBar.fillStyle(0xffff00);
        this._bossHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 50 + barHeight, barWidth * healthRatio, barHeight).setScrollFactor(0);
    }

    private bossTakeDamage(amount: number) {
        this._bossHealth = Phaser.Math.Clamp(this.bossHealth - amount, 0, this.bossMaxHealth);
        this.createBossHealthBar();
        if (this.bossHealth <= 0) {
            this.bossIsKilled = true;
        }
    }

    protected flipEnemy(spine: SpineGameObject, flip: boolean) {
        let body = spine.body as Phaser.Physics.Arcade.Body;
        body.setSize(spine.width - 50, spine.height);
        spine.scaleX = flip ? -BOSS_SCALE : BOSS_SCALE;

        if (flip) {
            body.setOffset(spine.width - body.width, body.offset.y);
        }
        else {
            body.setOffset(0, body.offset.y);
        }
    }
}