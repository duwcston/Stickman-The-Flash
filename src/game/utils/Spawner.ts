import { Enemy } from "../sprites/Enemy";
import { Boss } from "../sprites/Boss";
import { Player } from "../sprites/Player";

export class Spawner {
    private _scene: Phaser.Scene;
    private _enemy: Enemy;
    private _boss: Boss;
    private _timer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, enemy: Enemy, boss: Boss) {
        this._scene = scene;
        this._enemy = enemy;
        this._boss = boss;
    }

    public spawnEnemy(interval: number) {
        this._timer = this._scene.time.addEvent({
            delay: interval,
            callback: () => {
                const enemyKilled = Player.instancePlayer.enemyKilled;
                if (enemyKilled >= 3) {
                    this.updateSpawnTime(1000);
                }
                else {
                    this.spawnCreep();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    private updateSpawnTime(newInterval: number) {
        this._timer.remove();
        this._timer = this._scene.time.addEvent({
            delay: newInterval,
            callback: () => {
                const enemyKilled = Player.instancePlayer.enemyKilled;
                if (enemyKilled >= 15) {
                    this.destroyAllCreeps();
                    this.spawnBoss();
                    this._timer.remove();
                }
                else {
                    this.spawnCreep();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    private spawnCreep() {
        this._enemy.spawnCreep();
        Enemy.instanceEnemy.enemyGroup.add(this._enemy.enemy as unknown as Phaser.Physics.Arcade.Sprite);
    }

    private spawnBoss() {
        this._boss.spawnBoss();
        Enemy.instanceEnemy.enemyGroup.add(this._boss.enemy as unknown as Phaser.Physics.Arcade.Sprite);
    }

    private destroyAllCreeps() {
        Enemy.instanceEnemy.enemyHealth = 0;
        Enemy.instanceEnemy.enemyGroup.clear(true, true);
    }
}