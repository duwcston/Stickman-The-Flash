import { Enemy } from "./Enemy";

export class Player {
    scene: Phaser.Scene;
    player: Phaser.GameObjects.Sprite;
    x: number;
    y: number;
    ground: Phaser.GameObjects.Image;
    swordHitbox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    healthBar: Phaser.GameObjects.Graphics;
    private static _instancePlayer: Player;

    private _enemyKilled: number;
    private _isTakingDamage: boolean;
    private _maxHealth: number;
    private _health: number;

    static get instancePlayer() {
        return Player._instancePlayer;
    }

    constructor(scene: Phaser.Scene, ground: Phaser.GameObjects.Image) {
        Player._instancePlayer = this;

        this.scene = scene;
        this.ground = ground;
        this.createPlayer(this.scene.scale.width / 2, this.scene.scale.height - this.ground.height * 2 * 1.8);
        this.createSwordHitbox();
        this._enemyKilled = 0;

        this._maxHealth = 100;
        this._health = this._maxHealth
        this.healthBar = this.scene.add.graphics();
        this.createHealthBar();
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

    public set isTakingDamage(value: boolean) {
        this._isTakingDamage = value;
        if (this._isTakingDamage) {
            this.player.setTint(0xff0000);
            this.takeDamage(Enemy.instanceEnemy.enemyDamage);
        }
        else {
            this.player.clearTint();
        }
    }

    public createPlayer(x: number, y: number) {
        this.player = this.scene.physics.add.sprite(x, y, 'knight', 'Idle (1).png')
            .setSize(60, 110)
            .setGravityY(300)
            .setCollideWorldBounds(true);

        this.player.anims.play('idle');
        this.isTakingDamage = false;
        this.scene.physics.add.collider(this.player, this.ground);
    }

    private createSwordHitbox(): void {
        this.swordHitbox = this.scene.add.rectangle(0, 0, 54, 60, 0xffffff, 0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.scene.physics.add.existing(this.swordHitbox);
        this.swordHitbox.setVisible(false);
        this.scene.physics.world.remove(this.swordHitbox.body);
    }

    public attackEnemy(): void {
        if (!this.swordHitbox.body) {
            this.scene.physics.world.add(this.swordHitbox.body);
        }
        this.scene.physics.add.overlap(this.swordHitbox, Enemy.instanceEnemy.enemyGroup, this.killEnemy, undefined, this);
    }

    private killEnemy(_swordHitbox: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        this._enemyKilled++;
        // console.log('Enemy killed: ', this._enemyKilled);
        enemy.destroy();
        Enemy.instanceEnemy.enemyGroup.remove(enemy);
    }

    private createHealthBar() {
        const barWidth = 700;
        const barHeight = 15;
        const healthRatio = this.health / this.maxHealth;

        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth, barHeight);

        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth * healthRatio, barHeight);
    }
    
    public takeDamage(amount: number) {
        this._health = Phaser.Math.Clamp(this._health - amount, 0, this.maxHealth);
        this.createHealthBar();
    }
}