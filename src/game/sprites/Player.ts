import { Enemy } from "./Enemy";
import { Boss } from "./Boss";

export class Player {
    scene: Phaser.Scene;
    player: Phaser.GameObjects.Sprite;
    road: Phaser.GameObjects.Image;
    swordHitbox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerHealthBar: Phaser.GameObjects.Graphics;
    creepOverlap: Phaser.Physics.Arcade.Collider;
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
        this.createPlayer(this.scene.scale.width / 2, this.scene.scale.height / 2 + 50);
        this.createSwordHitbox();
        this._enemyKilled = 0;

        this._health = this._maxHealth
        this.playerHealthBar = this.scene.add.graphics();
        this.createPlayerHealthBar();
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
            .setGravityY(300);

        this.player.anims.play('idle');
        this.isTakingDamage = false;
        this.scene.physics.add.collider(this.player, this.road);
    }

    private createSwordHitbox(): void {
        this.swordHitbox = this.scene.add.rectangle(0, 0, 54, 60, 0xffffff, 0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.scene.physics.add.existing(this.swordHitbox);
        this.swordHitbox.visible = false;
        this.swordHitbox.body.enable = false;
        this.scene.physics.world.remove(this.swordHitbox.body);
    }

    public attackEnemy(): void {
        // console.log('Enemy count from player: ', Enemy.instanceEnemy.enemyGroup.countActive()); // Debugging
        this.creepOverlap = this.scene.physics.add.overlap(this.swordHitbox, Enemy.instanceEnemy.enemyGroup, this.killEnemy, undefined, this);
    }

    private killEnemy(_swordHitbox: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        Enemy.instanceEnemy.enemyHealth -= this.playerDamage;
        console.log('Enemy health: ', Enemy.instanceEnemy.enemyHealth); // Debugging
        if (Enemy.instanceEnemy.enemyHealth <= 0) {
            this._enemyKilled++;
            console.log('Enemy killed: ', this._enemyKilled);
            enemy.destroy();
            Enemy.instanceEnemy.enemyGroup.remove(enemy);
            Enemy.instanceEnemy.enemyHealth = Enemy.instanceEnemy.enemyMaxHealth;
        }
    }

    private createPlayerHealthBar() {
        const barWidth = 700;
        const barHeight = 15;
        const healthRatio = this.health / this.maxHealth;

        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0xff0000);
        this.playerHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth, barHeight);

        this.playerHealthBar.fillStyle(0x00ff00);
        this.playerHealthBar.fillRect(this.scene.scale.width / 2 - barWidth / 2, 0 + barHeight, barWidth * healthRatio, barHeight);
    }

    private takeDamage(amount: number) {
        this._health = Phaser.Math.Clamp(this._health - amount, 0, this.maxHealth);
        this.createPlayerHealthBar();
    }

    public attackBoss() {
        this.creepOverlap.active = false;
        this.scene.physics.add.overlap(this.swordHitbox, Enemy.instanceEnemy.enemyGroup, () => {
            if (this.player.anims.currentAnim?.key === 'attack') {
                this.scene.add.tween({
                    targets: Enemy.instanceEnemy.enemy,
                    ease: 'Sine.easeInOut',
                    duration: 100,
                    repeat: 0,
                    yoyo: true,
                    alpha: 0.5,
                    onStart: () => {
                        Boss.instanceBoss.bossIsTakingDamage = true;
                    },
                    onComplete: () => {
                        Boss.instanceBoss.bossIsTakingDamage = false;
                    }
                });
            }
        },
            undefined, this);
    }
}