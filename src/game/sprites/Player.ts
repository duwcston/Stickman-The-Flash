import { Enemy } from "./Enemy";
import { Boss } from "./Boss";

export class Player {
    scene: Phaser.Scene;
    player: SpineGameObject;
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
            this.player.setAnimation(0, 'hit', false);
            this.takeDamage(Enemy.instanceEnemy.enemyDamage);
        }
        else {
            this.player.setAnimation(0, 'idle', true);
        }
    }

    public createPlayer(x: number, y: number) {
        this.player = this.scene.add.spine(x, y, 'spiderman', 'idle', true);
        this.player.setScale(0.1);
        this.scene.physics.add.existing(this.player as unknown as Phaser.Physics.Arcade.Image);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setGravityY(300);
        this.isTakingDamage = false;
        this.scene.physics.add.collider(this.player as unknown as Phaser.Physics.Arcade.Image, this.road);
    }

    private createSwordHitbox(): void {
        this.swordHitbox = this.scene.add.rectangle(0, 0, 50, 50, 0xffffff, 0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.scene.physics.add.existing(this.swordHitbox);
        this.swordHitbox.visible = false;
        this.swordHitbox.body.enable = false;
        this.scene.physics.world.remove(this.swordHitbox.body);
    }

    public updateHitbox() {
        // Update sword hitbox position based on player direction
        this.swordHitbox.x = this.player.scaleX < 0
            ? this.player.x - 42
            : this.player.x + 42;
        this.swordHitbox.y = this.player.y - 52;
    }

    public attackEnemy(): void {
        // console.log('Enemy count from player: ', Enemy.instanceEnemy.enemyGroup.countActive()); // Debugging
        this.creepOverlap = this.scene.physics.add.overlap(this.swordHitbox, Enemy.instanceEnemy.enemyGroup, this.killEnemy, undefined, this);
    }

    private killEnemy(_swordHitbox: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        Enemy.instanceEnemy.enemyHealth -= this.playerDamage;
        // console.log('Enemy health: ', Enemy.instanceEnemy.enemyHealth); // Debugging
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
        const attackAnims = ['dash_attack', 'attack_dam', 'da'];

        this.scene.physics.add.overlap(this.swordHitbox, Enemy.instanceEnemy.enemyGroup, () => {
            const currentTrackEntry = this.player.state.getCurrent(0);
            const currentAnimation = currentTrackEntry?.animation?.name;

            if (attackAnims.includes(currentAnimation)) {
                const enemy = Enemy.instanceEnemy.enemy;
                Boss.instanceBoss.bossIsTakingDamage = true;
                enemy.state.setAnimation(0, 'hit', false);
                this.scene.time.delayedCall(100, () => {
                    Boss.instanceBoss.bossIsTakingDamage = false;
                    enemy.state.setAnimation(0, 'idle', true);
                });
            }
        }, undefined, this);
    }

}