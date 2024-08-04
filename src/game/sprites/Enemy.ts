import { Player } from "./Player";

export class Enemy {
    scene: Phaser.Scene;
    enemy: Phaser.GameObjects.Sprite;
    ground: Phaser.GameObjects.Image;
    player: Player;
    timer: Phaser.Time.TimerEvent;
    private static _instanceEnemy: Enemy;
    private _enemyGroup: Phaser.Physics.Arcade.Group;
    private _enemyDamage: number = 5;

    static get instanceEnemy() {
        return Enemy._instanceEnemy;
    }

    constructor(scene: Phaser.Scene, player: Player, ground: Phaser.GameObjects.Image) {
        Enemy._instanceEnemy = this;

        this.scene = scene;
        this.ground = ground;
        this.player = player;
        this._enemyGroup = this.scene.physics.add.group({
            classType: Phaser.GameObjects.Sprite,
            runChildUpdate: true
        });
    }

    get enemyGroup() {
        return this._enemyGroup;
    }

    get enemyDamage() {
        return this._enemyDamage;
    }

    private getRandomX() {
        const x = [0, this.scene.sys.canvas.width];
        return x[Math.floor(Math.random() * x.length)];
    }

    private getRandomY() {
        return Phaser.Math.Between(0, this.scene.sys.canvas.height - this.ground.height * 2 * 1.8);
    }

    private createEnemyImage() {
        this.enemy = this.scene.physics.add.sprite(this.getRandomX(), this.getRandomY(), 'knight').setSize(50, 110);
        if (this.enemy.x > this.player.player.x) {
            this.enemy.flipX = true;
        }
        this.enemy.tint = 0x000000;
        this.scene.physics.add.collider(this.enemy, this.ground, () => {
            (this.enemy.body as Phaser.Physics.Arcade.Body).setVelocityY(-300);
        });
        this._enemyGroup.add(this.enemy);
        this.enemyVsPlayer();
    }

    public enemyVsPlayer() {
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
                        this.chasePlayer(enemy);
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    public spawnEnemy(interval: number) {
        this.timer = this.scene.time.addEvent({
            delay: interval,
            callback: () => {
                this.createEnemyImage();
                if (Player.instancePlayer.enemyKilled >= 3) {
                    console.log('More enemy spawned');
                    this.updateSpawnTime(1000);
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    private updateSpawnTime(newInterval: number) {
        this.timer.remove();
        this.timer = this.scene.time.addEvent({
            delay: newInterval,
            callback: () => {
                this.createEnemyImage();
            },
            callbackScope: this,
            loop: true
        });
    }

    // private spawnBoss() {

    // }

    private attackPlayer(enemy: Phaser.GameObjects.Sprite) {
        (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 200);

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

    private chasePlayer(enemy: Phaser.GameObjects.Sprite) {
        this.scene.physics.moveToObject(enemy, this.player.player, 200);
        if (enemy.anims.currentAnim?.key !== 'run') {
            enemy.anims.play('run');
        }
    }

    private knockbackPlayer() {
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