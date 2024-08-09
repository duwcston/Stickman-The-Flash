import { Player } from "./Player";
import { Enemy } from "./Enemy";

export class Boss extends Enemy {
    private static _instanceBoss: Boss;
    private _bossDamage: number = 50;
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
            this._bossHealthBar.clear();
            this._enemyGroup.clear(true, true);
        }
    }

    public spawnBoss() {
        this.createBossImage();
        this.createBossHealthBar();
        Enemy.instanceEnemy.enemyDamage = this.bossDamage;
        Enemy.instanceEnemy.enemyHealth = this.bossMaxHealth;
        this.player.attackBoss();
    }

    protected createBossImage() {
        this.enemy = this.scene.physics.add.sprite(this.scene.scale.width / 2, 0, 'knight').setSize(60, 110);
        this.enemy.anims.play('idle');
        this.enemy.scale = 2;
        this._enemyGroup.add(this.enemy);
        this.scene.physics.add.collider(this.enemy, this.road, () => { });
        this.enemyVsPlayer();
        this.bossIsTakingDamage = false;

        const changeTint = () => {
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.enemy.setTint(randomColor);
        };

        this.scene.time.addEvent({
            delay: 500,
            callback: changeTint,
            callbackScope: this,
            loop: true
        });
    }

    protected enemyVsPlayer() {
        this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                const enemies = this._enemyGroup.getChildren() as Phaser.GameObjects.Sprite[];
                enemies.forEach((enemy) => {
                    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.player.x, this.player.player.y);
                    if (distance < 120) {
                        this.attackPlayer(enemy);
                    } else {
                        enemy.flipX = (enemy.body as Phaser.Physics.Arcade.Body).velocity.x < 0;
                        this.chasePlayer(enemy, 100);
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    public set bossIsTakingDamage(value: boolean) {
        this._bossIsTakingDamage = value;
        if (this._bossIsTakingDamage) {
            this.enemy.setTint(0x979eb7);
            this.bossTakeDamage(Player.instancePlayer.playerDamage);
        }
        else {
            this.enemy.clearTint();
        }
    }

    private createBossHealthBar() {
        const barWidth = 700;
        const barHeight = 30;
        const healthRatio = this.bossHealth / this.bossMaxHealth;

        this._bossHealthBar.clear();
        this._bossHealthBar.fillStyle(0xff0000);
        this._bossHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 50 + barHeight, barWidth, barHeight);

        this._bossHealthBar.fillStyle(0xffff00);
        this._bossHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 50 + barHeight, barWidth * healthRatio, barHeight);
    }

    private bossTakeDamage(amount: number) {
        this._bossHealth = Phaser.Math.Clamp(this.bossHealth - amount, 0, this.bossMaxHealth);
        this.createBossHealthBar();
        if (this.bossHealth <= 0) {
            this.bossIsKilled = true;
        }
    }
}