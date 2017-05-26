/**
 * Created by user_kevin on 17/5/23.
 */
var game = new Phaser.Game(240, 400, Phaser.AUTO, "game");
game.States = {};
var score = 0;

game.States.boot = function () {
    this.preload = function () {
        if (!game.device.desktop) {
            /**
             *屏幕的适配 - Phaser.ScaleManager.EXACT_FIT - 充满屏幕
             *屏幕的是撇 - Phaser.ScaleManager.SHOW_ALL  - 显示图片全部
             * */
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.forcePortrait = true;
            this.scale.refresh();
        }
        //加载 GIF 图片的问题 不支持 GIF 图片的播放  可以做一张图让 图片 scrollTo 做效果
        game.load.image("loading", "assets/preloader.gif");
    };
    this.create = function () {
        game.state.start("preload");
    }
};
game.States.preload = function () {
    this.preload = function () {
        var preloadSprite = game.add.sprite(game.width / 2 - 220 / 2, game.height / 2 - 19 / 2, 'loading');
        game.load.setPreloadSprite(preloadSprite);
        game.load.image("bg", "assets/bg.jpg");
        game.load.spritesheet('myPlane', 'assets/myplane.png', 40, 40, 4);
        game.load.spritesheet("button_begin", "assets/startbutton.png", 100, 40, 2);
        game.load.image('mybullet', 'assets/mybullet.png');

        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy1', 'assets/enemy1.png');
        game.load.image('enemy2', 'assets/enemy2.png');
        game.load.image('enemy3', 'assets/enemy3.png');
        game.load.spritesheet('explode1', 'assets/explode1.png', 20, 20, 3);
        game.load.spritesheet('explode2', 'assets/explode2.png', 30, 30, 3);
        game.load.spritesheet('explode3', 'assets/explode3.png', 50, 50, 3);

        game.load.spritesheet('myexplode', 'assets/myexplode.png', 40, 40, 3);

        game.load.onFileComplete.add(function (progress) {
            /**
             * 获得加载进度百分比
             * */
            console.log(progress);
        });

    };
    this.create = function () {
        game.state.start("main");
    }
};
game.States.main = function () {
    this.create = function () {
        // 背景
        var bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
        var plane = game.add.sprite(game.width / 2, game.height / 2, "myPlane");
        plane.animations.add("fly");
        plane.animations.play("fly", 12, true);
        plane.anchor.setTo(0.5, 0.5);
        var startButton = game.add.button(game.width / 2, game.height / 2 + 40, "button_begin", this.ButtonClick, this, 1, 1, 0)
        startButton.anchor.setTo(0.5, 0);
    };
    this.ButtonClick = function () {
        game.state.start("start");/** 跳转场景 */
    }
};
game.States.start = function () {
    var plane;
    this.create = function () {
        score = 0;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.tileSprite(0, 0, game.width, game.height, "bg").autoScroll(0, 20);
        plane = game.add.sprite(game.width / 2, game.height - 50, "myPlane");
        plane.anchor.setTo(0.5, 0);
        plane.animations.add("fly");
        plane.animations.play("fly", 12, true);
        game.physics.arcade.enable(plane);
        plane.body.collideWorldBounds = true;
        plane.level = 9;
// 动画
        var tween = game.add.tween(plane).to({y: game.height - 40}, 1000, Phaser.Easing.Sinusoidal.InOut, true);
        tween.onComplete.add(this.onStart, this);
    };
    this.onStart = function () {
        plane.inputEnabled = true;
        plane.input.enableDrag(false);
        this.zidans = game.add.group();
        this.zidans.enableBody = true;
        this.zidans.createMultiple(20, "mybullet");
        this.zidans.setAll("outOfBoundsKill", true);
        this.zidans.setAll("checkWorldBounds", true);
        this.zidanFire = true;
        this.zidanTime = 0;
        /**
         * 创建敌机
         * */
        var enemyTeam = {
            enemy1: {
                game: this,
                picture: "enemy1",
                zidanPicture: "bullet",
                baozhaPicture: "explode1",
                selfPool: 10,
                zidanPool: 50,
                baozhaPool: 10,
                life: 2,
                velocity: 50,
                zidanX: 9,
                zidanY: 20,
                zidanVolocity: 200,
                selfTimeInterVal: 2,
                zidanTimeInterval: 1000,
                score: 10
            },
            enemy2: {
                game: this,
                picture: "enemy2",
                zidanPicture: "bullet",
                baozhaPicture: "explode2",
                selfPool: 10,
                zidanPool: 50,
                baozhaPool: 10,
                life: 3,
                velocity: 40,
                zidanX: 13,
                zidanY: 30,
                zidanVolocity: 250,
                selfTimeInterVal: 3,
                zidanTimeInterval: 1200,
                score: 20
            },
            enemy3: {
                game: this,
                picture: "enemy3",
                zidanPicture: "bullet",
                baozhaPicture: "explode3",
                selfPool: 5,
                zidanPool: 25,
                baozhaPool: 5,
                life: 10,
                velocity: 30,
                zidanX: 22,
                zidanY: 50,
                zidanVolocity: 500,
                selfTimeInterVal: 10,
                zidanTimeInterval: 1500,
                score: 50
            }
        };
        this.enemy1 = new Enemy(enemyTeam.enemy1);
        this.enemy1.init();
        this.enemy2 = new Enemy(enemyTeam.enemy2);
        this.enemy2.init();
        this.enemy3 = new Enemy(enemyTeam.enemy3);
        this.enemy3.init();
    };
    this.update = function () {
        if (this.zidanFire) {
            this.myFireBullet();
            this.enemy1.dijiFire();
            this.enemy2.dijiFire();
            this.enemy3.dijiFire();
            //碰撞检测
            game.physics.arcade.overlap(this.zidans, this.enemy1.enemys, this.enemy1.hitDiji, null, this.enemy1);
            game.physics.arcade.overlap(this.zidans, this.enemy2.enemys, this.enemy2.hitDiji, null, this.enemy2);
            game.physics.arcade.overlap(this.zidans, this.enemy3.enemys, this.enemy3.hitDiji, null, this.enemy3);
            //敌机子弹
            game.physics.arcade.overlap(this.enemy1.enemyZiDans, plane, this.hidMyPlane, null, this);
            game.physics.arcade.overlap(this.enemy2.enemyZiDans, plane, this.hidMyPlane, null, this);
            game.physics.arcade.overlap(this.enemy3.enemyZiDans, plane, this.hidMyPlane, null, this);
        }
    };
    //自己开火
    this.myFireBullet = function () {
        if (plane.alive && game.time.now > this.zidanTime) {
            var bullet;
            bullet = this.zidans.getFirstExists(false);
            if (bullet) {
                bullet.anchor.setTo(0.5, 0);
                bullet.reset(plane.x, plane.y - 15);
                bullet.body.velocity.y = -400;
                this.zidanTime = game.time.now + 200;
            }
            if (plane.level >= 2) {
                bullet = this.zidans.getFirstExists(false);
                if (bullet) {
                    bullet.anchor.setTo(0.5, 0);
                    bullet.reset(plane.x, plane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = -40;
                    this.zidanTime = game.time.now + 200;
                }
                bullet = this.zidans.getFirstExists(false);
                if (bullet) {
                    bullet.anchor.setTo(0.5, 0);
                    bullet.reset(plane.x, plane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = 40;
                    this.zidanTime = game.time.now + 200;
                }
            }
            if (plane.level >= 3) {
                bullet = this.zidans.getFirstExists(false);
                if (bullet) {
                    bullet.anchor.setTo(0.5, 0);
                    bullet.reset(plane.x, plane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = -80;
                    this.zidanTime = game.time.now + 200;
                }
                bullet = this.zidans.getFirstExists(false);
                if (bullet) {
                    bullet.anchor.setTo(0.5, 0);
                    bullet.reset(plane.x, plane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = 80;
                    this.zidanTime = game.time.now + 200;
                }
            }
        }
    };
    //被敌机打中
    this.hidMyPlane = function (myplane, zidan) {
        zidan.kill();
        if (myplane.level > 1) {
            myplane.level--;
        } else {
            myplane.kill();
            this.dead();
        }
    };
    this.dead = function () {
        var baozhaWithMine = game.add.sprite(plane.x, plane.y, "myexplode");
        var baozha = baozhaWithMine.animations.add("myexplode");
        baozhaWithMine.animations.play("myexplode", 30, false, true);
        baozha.onComplete.add(this.gotoOver, this);
    };
    this.gotoOver = function () {
        game.state.start("over");
    };

};
game.States.over = function () {
    this.create = function () {
        game.add.tileSprite(0, 0, game.width, game.height, "bg");
        var scoreText = game.add.text(game.width / 2, game.height / 2, "score: " + score, {
            fontSize: "32px",
            fill: "#ff9527"
        });
        scoreText.anchor.setTo(0.5, 0.5);
        var button_reStart = game.add.button(game.width / 2, game.height / 2 + 50, "button_begin", this.buttonClick, this, 1, 1, 0);
        button_reStart.anchor.setTo(0.5, 0.5);
    }
    this.buttonClick = function () {
        game.state.start("start");
    }
};
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);
game.state.add('over', game.States.over);
game.state.start('boot');

function Enemy(config) {
    this.init = function () {
        this.enemys = game.add.group();
        this.enemys.enableBody = true;
        this.enemys.createMultiple(config.selfPool, config.picture);
        this.enemys.setAll("outOfBoundsKill", true);
        this.enemys.setAll("checkWorldBounds", true);
        //子弹
        this.enemyZiDans = game.add.group();
        this.enemyZiDans.enableBody = true;
        this.enemyZiDans.createMultiple(config.zidanPool, config.zidanPicture);
        this.enemyZiDans.setAll("outOfBoundsKill", true);
        this.enemyZiDans.setAll("checkWorldBounds", true);
        // 敌机位置的计算
        this.maxWidth = game.width - game.cache.getImage(config.picture).width;
        //产生敌机的定时器
        game.time.events.loop(Phaser.Timer.SECOND * config.selfTimeInterVal, this.generateEnemy, this);
        //敌机的爆炸效果
        this.baozhas = game.add.group();
        this.baozhas.createMultiple(config.baozhaPool, config.baozhaPicture);
        this.baozhas.forEach(function (baozha) {
            baozha.animations.add(config.baozhaPicture);
        }, this);
    };
    //产生敌机
    this.generateEnemy = function () {
        var a = this.enemys.getFirstExists(false);
        if (a) {
            a.reset(game.rnd.integerInRange(0, this.maxWidth), -game.cache.getImage(config.picture).height);
            a.life = config.life;
            a.body.velocity.y = config.velocity;
        }
    };
    this.dijiFire = function () {
        this.enemys.forEachExists(function (enemy) {
            var zidan = this.enemyZiDans.getFirstExists(false);
            if (zidan) {
                if (game.time.now > (enemy.zidanTime || 0)) {
                    zidan.reset(enemy.x + config.zidanX, enemy.y + config.zidanY);
                    zidan.body.velocity.y = config.zidanVolocity;
                    enemy.zidanTime = game.time.now + config.zidanTimeInterval;
                }
            }
        }, this);
    };
    this.hitDiji = function (myZidan, diji) {
        myZidan.kill();
        diji.life--;
        if (diji.life <= 0) {
            diji.kill();
            var baozha = this.baozhas.getFirstExists(false);
            baozha.reset(diji.body.x, diji.body.y);
            baozha.play(config.baozhaPicture, 30, false, true);
            score += config.score;
        }
    };
}