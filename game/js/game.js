// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
var count = document.getElementById('count');

var SCALE = 30;
var NULL_CENTER = {x: null, y: null};

var cache = {};

function Entity(id, x, y, angle, center, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle || 0;
    this.center = center;
    this.color = color || "red";
}

Entity.prototype.update = function (state) {
    this.x = state.x;
    this.y = state.y;
    this.center = state.c;
    this.angle = state.a;
}

Entity.prototype.draw = function (ctx) {
}

Entity.build = function (def) {
    if (def.radius) {
        return new CircleEntity(def.id, def.x, def.y, def.angle, NULL_CENTER, def.color, def.radius);
    } else {
        return new RectangleEntity(def.id, def.x, def.y, def.angle, NULL_CENTER, def.color, def.halfWidth, def.halfHeight);
    }
}

function CircleEntity(id, x, y, angle, center, color, radius) {
    color = color || 'aqua';
    Entity.call(this, id, x, y, angle, center, color);
    this.radius = radius;
}
CircleEntity.prototype = new Entity();
CircleEntity.prototype.constructor = CircleEntity;

CircleEntity.prototype.draw = function (ctx, position) {

    var cached = cache[this.id];


    var radius = this.radius + 0.3;
    var scaledRadius = radius * SCALE;
    var canvasRadius = scaledRadius + 6;

    if (!cached) {
        cache[this.id] = {};

        var canvasTemp = document.createElement("canvas"),
            cached = canvasTemp.getContext("2d");
        canvasTemp.height = canvasTemp.width = (canvasRadius) * 2;
        cached.fillStyle = 'transparent';
        cached.strokeStyle = this.color;


        cached.beginPath();
        cached.shadowColor = '#666';
        cached.shadowOffsetX = 0;
        cached.shadowOffsetY = 2;
        cached.lineWidth = "4";

        cached.arc(canvasRadius, canvasRadius, scaledRadius, 0, Math.PI, true);
        cached.fill();
        cached.stroke();

        cache[this.id]['back'] = cached;

        canvasTemp = document.createElement("canvas"),
            cached = canvasTemp.getContext("2d");
        canvasTemp.height = canvasTemp.width = (canvasRadius) * 2;
        cached.fillStyle = 'transparent';
        cached.strokeStyle = this.color;


        cached.beginPath();
        cached.shadowColor = '#666';
        cached.shadowOffsetX = 0;
        cached.shadowOffsetY = 2;
        cached.lineWidth = "4";

        cached.arc(canvasRadius, canvasRadius, scaledRadius, Math.PI, Math.PI * 2, true);
        cached.fill();
        cached.stroke();
        cache[this.id]['front'] = cached;

        canvasTemp = document.createElement("canvas"),
            cached = canvasTemp.getContext("2d");
        canvasTemp.height = canvasTemp.width = (canvasRadius) * 2;
        cached.fillStyle = 'transparent';
        cached.strokeStyle = this.color;


        cached.beginPath();
        cached.shadowColor = '#666';
        cached.shadowOffsetX = 0;
        cached.shadowOffsetY = 2;
        cached.lineWidth = "4";

        cached.arc(canvasRadius, canvasRadius, scaledRadius, 0, Math.PI * 2, true);
        cached.fill();
        cached.stroke();

        cache[this.id]['full'] = cached;
    }

    if (position != 'front') {
        if (sensors.indexOf(this.id) > -1) {
            ctx.drawImage(cache[this.id]['back'].canvas, this.x * SCALE - canvasRadius, this.y * SCALE - canvasRadius);
        }
    } else {
        if (sensors.indexOf(this.id) > -1) {
            ctx.drawImage(cache[this.id]['front'].canvas, this.x * SCALE - canvasRadius, this.y * SCALE - canvasRadius);
        }
        else {
            ctx.drawImage(cache[this.id]['full'].canvas, this.x * SCALE - canvasRadius, this.y * SCALE - canvasRadius);
        }
    }

    Entity.prototype.draw.call(this, ctx);
}

function RectangleEntity(id, x, y, angle, center, color, halfWidth, halfHeight) {
    Entity.call(this, id, x, y, angle, center, color);
    this.halfWidth = halfWidth;
    this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

RectangleEntity.prototype.draw = function (ctx) {

    Entity.prototype.draw.call(this, ctx);
}

var world = {};
var bodiesState = null;
var box = null;
var gameOverTimer = 0;

function update(animStart) {
    box.update();
    bodiesState = box.getState();

    for (var id in bodiesState) {
        var entity = world[id];
        if (entity) entity.update(bodiesState[id]);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (var id in world) {
        var entity = world[id];
        entity.draw(ctx);
    }

    ctx.drawImage(stroke, 0, -100);

    for (var id in world) {
        var entity = world[id];
        if (id.indexOf('ball') == -1) continue;
        entity.draw(ctx, 'front');
    }

}


function init() {

    countNumber = 0;
    sensors = [];
    ctx = document.getElementById("gameCanvas").getContext("2d");
    canvasWidth = ctx.canvas.width;
    canvasHeight = ctx.canvas.height;

    console.log(canvasWidth);
    console.log(canvasHeight);

    initialState = [
        {id: "top-fixed", x: 0, y: 0, angle: 0, halfHeight: 0.5, halfWidth: ctx.canvas.width / SCALE, color: 'transparent'},
        {id: "left-fixed", x: 0, y: 0, angle: Math.PI / 2, halfHeight: 0.5, halfWidth: ctx.canvas.height / SCALE, color: 'transparent'},
        {id: "right-fixed", x: ctx.canvas.width / SCALE, y: 0, angle: Math.PI / 2, halfHeight: 0.5, halfWidth: ctx.canvas.height / SCALE, color: 'transparent'},

        {id: "ground-left-fixed", x: ctx.canvas.width / 2 / SCALE - 4, y: ctx.canvas.height / SCALE, angle: 0, halfHeight: 0.5, halfWidth: ctx.canvas.width / SCALE, color: 'transparent'},
        {id: "ground-right-fixed", x: ctx.canvas.width / 6 / SCALE + 1, y: ctx.canvas.height / SCALE, angle: -(15 * Math.PI) / 180, halfHeight: 0.5, halfWidth: ctx.canvas.width / SCALE, color: 'transparent'},
        {id: "ball1", x: 2, y: 14, radius: 0.4, color: 'red'},
        {id: "ball5", x: 6, y: 14, radius: 0.4, color: 'red'},
        {id: "ball9", x: 10, y: 14, radius: 0.4, color: 'red'},
        {id: "ball2", x: 3, y: 18, radius: 0.4, color: 'green'},
        {id: "ball6", x: 7, y: 18, radius: 0.4, color: 'green'},
        {id: "ball10", x: 11, y: 18, radius: 0.4, color: 'green'},
        {id: "ball3", x: 4, y: 14, radius: 0.4, color: 'blue'},
        {id: "ball7", x: 8, y: 14, radius: 0.4, color: 'blue'},
        {id: "ball11", x: 12, y: 14, radius: 0.4, color: 'blue'},
        {id: "ball4", x: 5, y: 18, radius: 0.4, color: 'yellow'},
        {id: "ball8", x: 9, y: 18, radius: 0.4, color: 'yellow'},
        {id: "ball12", x: 13, y: 18, radius: 0.4, color: 'yellow'},


        {id: "nail1-fixed-sensor", x: 10.2, y: ctx.canvas.height / SCALE - 12, radius: 0.1, color: 'red'},
        {id: "nail2-fixed-sensor", x: 12.1, y: ctx.canvas.height / SCALE - 14, radius: 0.1, color: 'red'},
        {id: "nail3-fixed-sensor", x: 14, y: ctx.canvas.height / SCALE - 11, radius: 0.1, color: 'red'},
        {id: "stopper1-fixed-sensor", x: 10.2, y: ctx.canvas.height / SCALE - 10, radius: 0.1, color: 'transparent'},
        {id: "stopper2-fixed-sensor", x: 12.1, y: ctx.canvas.height / SCALE - 10, radius: 0.1, color: 'transparent'},
        {id: "stopper3-fixed-sensor", x: 14, y: ctx.canvas.height / SCALE - 8, radius: 0.1, color: 'transparent'}
    ];

    var running = true;
    var impulseTimeout = null;
    var initTimeout = null;
    particles = 12;
    controller = null;
    controller1 = null;
    restart = false;

    stack1 = 0;
    stack2 = 0;

    for (var i = 0; i < initialState.length; i++) {
        world[initialState[i].id] = Entity.build(initialState[i]);
    }


    box = new bTest(60, false, canvasWidth, canvasHeight, SCALE);

    box.setBodies(world, false);

    controller = new Box2D.Dynamics.Controllers.b2ConstantAccelController();

    controller1 = new Box2D.Dynamics.Controllers.b2ConstantAccelController();

    var contactListener = new Box2D.Dynamics.b2ContactListener;
    contactListener.BeginContact = function (contact) {

        if (contact.m_fixtureB.m_body.m_userData.indexOf('nail') > -1) {
            if (contact.m_fixtureA.m_body.GetLinearVelocity().y < 0) {
                return;
            }

            if(Math.abs(contact.m_fixtureA.m_body.GetPosition().x - contact.m_fixtureB.m_body.GetPosition().x) > 0.20) {
                return;
            }

            console.log(JSON.stringify(contact.m_fixtureA.m_body.GetPosition()));
            console.log(JSON.stringify(contact.m_fixtureB.m_body.GetPosition()));

            contact.m_fixtureA.SetSensor(true);
            contact.m_fixtureA.m_body.SetLinearVelocity(new b2Vec2(0, 0));
            contact.m_fixtureA.m_body.SetAngularVelocity(0);
            removeBody(box.bodiesMap[contact.m_fixtureA.m_body.m_userData]);
            removeBody1(box.bodiesMap[contact.m_fixtureA.m_body.m_userData]);

            sensors.push(contact.m_fixtureA.m_body.m_userData);

            stack2 += 1;
        }

        if (contact.m_fixtureB.m_body.m_userData.indexOf('stopper') > -1
            && contact.m_fixtureA.IsSensor()) {
            contact.m_fixtureA.m_body.SetType(b2Body.b2_staticBody);
        }

        if (countNumber < stack2) {
            countNumber = stack2;
            count.innerText = countNumber + '/' + particles;
        }


    };

    if (!restart) {
        for (var key in box.bodiesMap) {
            if (key.indexOf('ball') == -1) {
                continue;
            }
            controller1.AddBody(box.bodiesMap[key]);

        }

        box.world.SetContactListener(contactListener);

        box.world.AddController(controller);


        box.world.AddController(controller1);
    }

}

var restart = false;

var ax = 0, ay = 0;

$(document).ready(function () {

    //Build Bubble Machines with the Bubble Engine ------------------------
    var bubbleMachine = $().BubbleEngine({
        particleSizeMin: 0,
        particleSizeMax: 50,
        particleAnimationDuration: 500,
        particleScatteringX: 200,
        particleScatteringY: 200,
        particleSourceX: 70,
        particleSourceY: 670,
        particleDirection: 'right',
        gravity: -300,
        imgSource: 'bubble.png'
    });

    $('#front').bind('mousedown touchstart', function () {

        for (var key in box.bodiesMap) {
            if (key.indexOf('ball') == -1) {
                continue;
            }
            var point = box.bodiesMap[key].GetWorldPoint(box.bodiesMap[key].GetLocalCenter());
            if (point.x < 5.5) {
                controller.AddBody(box.bodiesMap[key]);
            }

        }

        controller.A = new b2Vec2(0, -15);

        //bubbleMachine.addBubbles(5);
        document.getElementById("bubbleAudio").play();
    });

    $('body').bind('mouseup touchend', function () {
        controller.A = new b2Vec2(0, 0);

        for (var key in box.bodiesMap) {
            removeBody(box.bodiesMap[key]);
        }

        //bubbleMachine.removeBubbles();
        document.getElementById("bubbleAudio").pause();
    });

    $('#waitContainer a').bind('mouseup touchend', function () {
        if (gameOverTimer <= 0) {
            restart = true;
            $(gameOver).hide();
            show = false;
            total = 0;
        }
    });


    $('#ok a').bind('mouseup touchend', function () {
        $.post('index.php', $('#ok form').serialize(), function () {
            $('#ok').hide();
            gameOverTimer = 3000;
            $('#waitContainer').show();
        })
    });

    $('form').bind('submit', function () {
        $.post('index.php', $('#ok form').serialize(), function () {
            $('#ok').hide();
            gameOverTimer = 3000;
            $('#waitContainer').show();
        })

        return false;
    });


    window.ondevicemotion = function (event) {
        ax = event.accelerationIncludingGravity.x;
    }

    window.ondeviceorientation = function (event) {
        a = event.alpha;
        b = event.beta;
        g = event.gamma;
    }

    setInterval(function () {
        if (typeof controller1 != 'undefined') {
            controller1.A = new b2Vec2(ax / 2, 0);
        }

//        var old = -40;

//        $('body').css('background-position-x', old + g / 2 + 'px');
    }, 100);

    stroke = new Image();

    stroke.onload = function () {

        init();

        (function loop(animStart) {
            if (restart) {
                init();
                restart = false;
                total = 0;
            }
            update(animStart);
            draw();
            requestAnimFrame(loop);
        })();
    }


    stroke.src = 'images/cactus.png';

});

function removeBody(body) {
    try {
        controller.RemoveBody(body);
    } catch (e) {
    }
}


function removeBody1(body) {
    try {
        controller1.RemoveBody(body);
    } catch (e) {
    }
}

var total = 0;

var timer = document.getElementById('timer');

var gameOver = document.getElementById('gameOver');

var wait = document.getElementById('wait');


var scoreLabel = document.getElementById('scoreLabel');

var score = document.getElementById('score');

var ok = document.getElementById('ok');

var show = false;

setInterval(function () {
    if (countNumber < particles) {
        timer.innerText = parseFloat(total / 1000).toFixed(1);
        total += 1000;
        show = true;
    } else if (gameOverTimer >= 0) {
        wait.innerText = parseFloat(gameOverTimer / 1000).toFixed(1);
        gameOverTimer -= 1000;
    } else {
        scoreLabel.innerText = score.value = total;
        if (show) {
            $(waitContainer).hide();
            $(ok).show();
            $(gameOver).show();
            show = false;
        }
    }

}, 1000);


document.ontouchstart = function (e) {
    e.preventDefault();
}