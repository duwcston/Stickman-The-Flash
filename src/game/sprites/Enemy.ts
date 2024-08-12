import { ENEMY_ATTACK_RANGE, ENEMY_SPEED, ENEMY_SCALE } from "../utils/Constant";
import { Player } from "./Player";

export class Enemy {
    scene: Phaser.Scene;
    enemy: SpineGameObject
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
            gravityY: 500
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
        return Phaser.Math.Between(0, this.scene.scale.height - 100);
    }

    private createEnemyImage() {
        this.enemy = this.scene.add.spine(this.getRandomX(), this.getRandomY(), 'enemy');
        this.enemy.setScale(ENEMY_SCALE);
        this.scene.physics.add.existing(this.enemy as unknown as Phaser.Physics.Arcade.Sprite);
        if (this.enemy.x > this.player.player.x) {
            this.flipEnemy(this.enemy, true);
        }
        this.scene.physics.add.collider(this.enemy as unknown as Phaser.Physics.Arcade.Sprite, this.road);
        this._enemyGroup.add(this.enemy as unknown as Phaser.Physics.Arcade.Sprite);
        this.enemyVsPlayer();
        // console.log('Enemy spawned', this._enemyGroup.countActive()); // Debugging
    }

    public spawnCreep() {
        this.createEnemyImage();
    }

    protected enemyVsPlayer() {
        this.scene.time.addEvent({
            delay: 100, 
            callback: () => {
                const enemies = this._enemyGroup.getChildren() as unknown as SpineGameObject[];
                enemies.forEach((enemy) => {
                    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.player.x, this.player.player.y);
                    if (distance < ENEMY_ATTACK_RANGE) {
                        this.enemy.state.timeScale = 0.5;
                        this.attackPlayer(enemy);
                    } else {
                        const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
                        this.flipEnemy(enemy, enemyBody.velocity.x < 0);
                        this.chasePlayer(enemy, ENEMY_SPEED);
                    }
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    protected attackPlayer(enemy: SpineGameObject) {
        // Ensure the enemy stops any current movement
        (enemy.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 300);
        const enemyAttackAnims = ['dash_attack', 'attack_dam', 'attack_dam2', 'da', 'da2'];
        const currentTrackEntry = enemy.state.getCurrent(0);
        const currentAnimation = currentTrackEntry?.animation?.name;

        if (!enemyAttackAnims.includes(currentAnimation)) {
            enemy.state.setAnimation(0, Phaser.Utils.Array.GetRandom(enemyAttackAnims), false);
            enemy.state.addListener({
                event: () => { },
                start: () => { },
                interrupt: () => { },
                end: () => { },
                dispose: () => { },
                complete: (trackEntry) => {
                    if (enemyAttackAnims.includes(trackEntry.animation.name)) {
                        enemy.state.setAnimation(0, 'idle', true);
                        this.player.isTakingDamage = true;
                        this.scene.time.delayedCall(100, () => {
                            this.player.isTakingDamage = false;
                        });
                    }
                }
            });
        }
    }

    protected chasePlayer(enemy: SpineGameObject, chaseSpeed: number) {
        this.scene.physics.moveToObject(enemy as unknown as Phaser.Physics.Arcade.Sprite, this.player.player, chaseSpeed);

        const currentTrackEntry = this.enemy.state.getCurrent(0);
        const currentAnimation = currentTrackEntry?.animation?.name;

        if (currentAnimation !== 'dash') {
            enemy.setAnimation(0, 'dash', true);
        }
    }

    protected flipEnemy(spine: SpineGameObject, flip: boolean) {
        let body = spine.body as Phaser.Physics.Arcade.Body;
        body.setSize(spine.width, spine.height);
        spine.scaleX = flip ? -ENEMY_SCALE : ENEMY_SCALE;

        if (flip) {
            body.setOffset(spine.width - body.width, body.offset.y);
        }
        else {
            body.setOffset(0, body.offset.y);
        }
    }
}