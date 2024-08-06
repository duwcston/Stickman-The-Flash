import { Player } from "./Player";

export class Enemy {
    scene: Phaser.Scene;
    enemy: Phaser.GameObjects.Sprite;
    road: Phaser.GameObjects.Image;
    player: Player;
    private static _instanceEnemy: Enemy;
    protected _enemyGroup: Phaser.Physics.Arcade.Group;
    private _enemyHealth: number;
    private _enemyMaxHealth: number = 10;
    private _enemyDamage: number = 10;

    static get instanceEnemy() {
        return Enemy._instanceEnemy;
    }

    constructor(scene: Phaser.Scene, player: Player, road: Phaser.GameObjects.Image) {
        Enemy._instanceEnemy = this;

        this.scene = scene;
        this.road = road;
        this.player = player;
        this._enemyHealth = this._enemyMaxHealth;
        this._enemyGroup = this.scene.physics.add.group({
            classType: Phaser.GameObjects.Sprite,
            runChildUpdate: true,
        });
    }

    get enemyGroup() {
        return this._enemyGroup;
    }

    get enemyHealth() {
        return this._enemyHealth;
    }

    get enemyMaxHealth() {
        return this._enemyMaxHealth;
    }

    get enemyDamage() {
        return this._enemyDamage;
    }

    set enemyHealth(value: number) {
        this._enemyHealth = value;
    }

    set enemyMaxHealth(value: number) {
        this._enemyMaxHealth = value;
    }

    set enemyDamage(value: number) {
        this._enemyDamage = value;
    }

    private getRandomX() {
        const x = [0, this.scene.scale.width];
        return x[Math.floor(Math.random() * x.length)];
    }

    private getRandomY() {
        return Phaser.Math.Between(0, this.scene.scale.height - 80);
    }

    protected createEnemyImage() {
        this.enemy = this.scene.physics.add.sprite(this.getRandomX(), this.getRandomY(), 'knight').setSize(50, 110).setGravityY(300);
        if (this.enemy.x > this.player.player.x) {
            this.enemy.flipX = true;
        }
        this.enemy.tint = 0x000000;
        this.scene.physics.add.collider(this.enemy, this.road, () => {
            (this.enemy.body as Phaser.Physics.Arcade.Body).setVelocityY(300);
        });
        this._enemyGroup.add(this.enemy);
        this.enemyVsPlayer();
        // console.log('Enemy spawned', this._enemyGroup.countActive()); // Debugging
    }

    public spawnCreep() {
        this.createEnemyImage();
    }

    protected enemyVsPlayer() {
        this.scene.time.addEvent({
            delay: 100, // Check every 100ms
            callback: () => {
                const enemies = this._enemyGroup.getChildren() as Phaser.GameObjects.Sprite[];
                enemies.forEach((enemy) => {
                    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.player.x, this.player.player.y);
                    if (distance < 70) {
                        this.attackPlayer(enemy);
                    } else {
                        enemy.flipX = (enemy.body as Phaser.Physics.Arcade.Body).velocity.x < 0
                        this.chasePlayer(enemy, 300);
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    protected attackPlayer(enemy: Phaser.GameObjects.Sprite) {
        (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 300);

        if (enemy.anims.currentAnim?.key !== 'attack') {
            enemy.anims.play('attack');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            enemy.on('animationcomplete', (anim: Phaser.Animations.Animation, _frame: Phaser.Animations.AnimationFrame) => {
                if (anim.key === 'attack') {
                    enemy.anims.play('attack');
                    this.knockbackPlayer();
                }
            });
        }
    }

    protected chasePlayer(enemy: Phaser.GameObjects.Sprite, chaseSpeed: number) {
        this.scene.physics.moveToObject(enemy, this.player.player, chaseSpeed);
        if (enemy.anims.currentAnim?.key !== 'run') {
            enemy.anims.play('run');
        }
    }

    protected knockbackPlayer() {
        const enemies = this._enemyGroup.getChildren() as Phaser.GameObjects.Sprite[];
        enemies.forEach((enemy) => {
            if (enemy.anims.currentAnim?.key === 'attack') {
                this.scene.add.tween({
                    targets: this.player.player,
                    x: this.player.player.x + (this.enemy.x > this.player.player.x ? -50 : 50),
                    duration: 100,
                    yoyo: true,
                    onStart: () => {
                        this.player.isTakingDamage = true;
                    },
                    onComplete: () => {
                        this.player.isTakingDamage = false;
                    }
                });
            }
        });
    }
}