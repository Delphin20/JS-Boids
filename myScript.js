
var canvasWidth = 800;
var canvasHeight = 600;

//Canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

//0 - Attractor
//1 - Detractor
var mouseType = -1;
var objType = -1;

//0 - false
//1 - true
var drawObj = 0;

//Global Attractor/Detractor position var
var objPos = new Vec2(0,0);

//Global Cohesion, Separation and Alignment Vars
var cohVar = 50.0;
var sepVar = 50.0;
var aliVar = 50.0;

//Global Speed Var
var speedVar = 2.0;


//Boids
var maxBoids = 50;
var myBoids = new Array();
//add Boid objects to array
for (var i = 0; i < maxBoids; i++) {
    var x = Math.floor(Math.random() * canvasWidth);
    var y = Math.floor(Math.random() * canvasHeight);
    var boidPos = new Vec2(x, y);
    myBoids[i] = new Boid(boidPos);
}

//When Slider is moved
function OnSliderInput() {

    //Add/Remove Boids
    var prevMax = maxBoids; //save prev array size
    var newMax = document.getElementById('boidCount');  //set new size
    maxBoids = newMax.value;

    if (prevMax - maxBoids < 0) {
        //add boids
        for (var i = 0; i < Math.abs(prevMax - maxBoids); i++) {
            myBoids.push(new Boid(new Vec2(Math.floor(Math.random() * canvasWidth), Math.floor(Math.random() * canvasHeight))));
        }
    }
    else {
        //remove boids
        for (var j = 0; j < Math.abs(prevMax - maxBoids); j++) {
            myBoids.pop();
        }
    } 
    var message = 'Boids: ' + maxBoids;
    document.getElementById('debug').innerHTML = message;  
}
//Speed Slider
function OnSliderInput2() {
    var newSpeed = document.getElementById('boidSpeed');
    speedVar = (newSpeed.value / 100) * 3 + 0.5;


    var message0 = 'Speed: ' + speedVar;
    document.getElementById('debug').innerHTML = message0;

}
//Cohesion Slider
function OnSliderInput3() {
    var newCoh = document.getElementById('boidCoh');
    cohVar = newCoh.value;

    var message1 = 'Cohesion: ' + cohVar;
    document.getElementById('debug').innerHTML = message1;

}
//Separation Slider
function OnSliderInput4() {
    var newSep = document.getElementById('boidSep');
    sepVar = newSep.value;

    var message2 = 'Separation: ' + sepVar;
    document.getElementById('debug').innerHTML = message2;

}
//Alignment Slider
function OnSliderInput5() {
    var newAli = document.getElementById('boidAli');
    aliVar = newAli.value;

    var message3 = 'Alignment: ' + aliVar;
    document.getElementById('debug').innerHTML = message3;

}
//Mouse Position
function getMousePos(evt) {
    var rect = c.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Attractor & Detractor Radio Buttons
function onRadioBtn0(){
    mouseType = 0;
    drawObj = 0;
}
function onRadioBtn1(){
    mouseType = 1;
    drawObj = 0;
}
//Mouse Click Event Listener
c.addEventListener('click', function (evt) {
    drawObj = 1;//set obj to true

    var mousePos = getMousePos(evt);
    objPos.x = mousePos.x;
    objPos.y = mousePos.y;
    //Attractor
    if (mouseType == 0) {
        objType = 0;
    }
	//Detractor
    if (mouseType == 1) {
        objType = 1;
    }

}, false);

function drawToCanvas() {
    //reset canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //attractors & detractors
    if(drawObj == 1){
        if(objType == 0){
            ctx.beginPath();
            ctx.arc(objPos.x,objPos.y,20,0,2*Math.PI);
            ctx.fillStyle="#00FF00";
            ctx.fill();
        }
        if(objType == 1){
            ctx.beginPath();
            ctx.arc(objPos.x,objPos.y,20,0,2*Math.PI);
            ctx.fillStyle="#FF0000";
            ctx.fill();
        }
    }
    //draw boids
    for (var i = 0; i < myBoids.length; i++) {
        myBoids[i].run(myBoids);
    }
}
//draw to canvas every 5ms (increase to slow it down)
setInterval("drawToCanvas()", 15);


//Boids Class Begin ---------------------------------------------------
/*
Javascript Boid Class
Author: Shannon Fenton
Based upon Craig Reynolds' Boid principles | http://www.red3d.com/cwr/boids/

*/
function Boid(pos_) {

    //initial position, acceleration and velocity
    this.pos = new Vec2(pos_.x, pos_.y);
    this.acc = new Vec2(0, 0);
    this.vel = new Vec2(Math.random() * 5 - 2, Math.random() * 5 - 2); //random velocity (between -2 and 2)

    //max speed boid can move per frame
    this.maxSpeed = speedVar;

    //max steering force
    this.maxSteer = 0.1;

    //boid length
    this.size = 8;
}

//COHESION, ALIGNMENT, SEPARATION
Boid.prototype.cohesion = function (boidArray_) {
    var neighbourDist = cohVar;
    var sum = new Vec2(0, 0); //sum of neighbours' velocities
    var totNeighbours = 0;

    for (var i = 0; i < boidArray_.length; i++) {
        var diff = new Vec2(0, 0);
        diff = this.pos.subV(boidArray_[i].pos);
        var dist = 0;
        dist = diff.length();

        if (dist > 0 && dist < neighbourDist) {
            sum = sum.addV(boidArray_[i].pos);
            totNeighbours++;
        }
    }

    if (totNeighbours > 0) {
        sum = sum.divS(totNeighbours);
        return this.steer(sum, false);
    }
    else {
        return new Vec2(0, 0);
    }

}
Boid.prototype.alignment = function (boidArray_) {
    var neighbourDist = aliVar;
    var sum = new Vec2(0, 0); //sum of neighbours' velocities
    var totNeighbours = 0;

    for (var i = 0; i < boidArray_.length; i++) {
        var diff = new Vec2(0, 0);
        diff = this.pos.subV(boidArray_[i].pos);
        var dist = 0;
        dist = diff.length();

        if (dist > 0 && dist < neighbourDist) {
            sum = sum.addV(boidArray_[i].vel);
            totNeighbours++;
        }
    }

    if (totNeighbours > 0) {
        sum = sum.divS(totNeighbours);
    }
    return sum;
}
Boid.prototype.separation = function (boidArray_) {
    var desiredSep = sepVar;
    var steerVec = new Vec2(0, 0); //direction to steer to keep away from other boids
    var totNeighbours = 0;

    for (var i = 0; i < boidArray_.length; i++) {
        var diff = new Vec2(0, 0);
        diff = this.pos.subV(boidArray_[i].pos);

        var dist = 0;
        dist = diff.length();

        if (dist > 0 && dist < desiredSep) {
            var awayVec = new Vec2(1, 1);
            awayVec = this.pos.subV(boidArray_[i].pos);
            awayVec.normalize();
            awayVec = awayVec.divS(dist);

            steerVec = steerVec.addV(awayVec);
            totNeighbours++;
        }
    }
    if (totNeighbours > 0) {
        steerVec = steerVec.divS(totNeighbours);
    }

    if (steerVec.length() > 0) {
        steerVec.normalize();
        steerVec = steerVec.mulS(this.maxSpeed);
        steerVec = steerVec.subV(this.vel);
        if (steerVec.length() > this.maxSteer) {
            //limit the steerVec magnitude!
            steerVec.normalize();
            steerVec = steerVec.mulS(this.maxSteer);
        }
    }
    return steerVec;
}

//Attractor & Detractor////////////////////////////////////////////
Boid.prototype.attract = function (targetVector_) {
    var steerVec = new Vec2(0, 0);
    steerVec = this.steer(new Vec2(targetVector_.x, targetVector_.y), true);

//    this.acc = steerVec;

    this.acc.addV(steerVec);
}

Boid.prototype.detract = function (target_) {
    var desiredSep = 100;
    var steerVec = new Vec2(0, 0); //direction to steer to keep away from predator

    var diff = new Vec2(0, 0);
    diff = this.pos.subV(target_);

    var dist = 0;
    dist = diff.length();

    if (dist > 0 && dist < desiredSep) {
        var awayVec = new Vec2(1, 1);
        awayVec = this.pos.subV(target_);
        awayVec.normalize();
        awayVec = awayVec.divS(dist);

        steerVec = steerVec.addV(awayVec);

        if (steerVec.length() > 0) {
            steerVec.normalize();
            steerVec = steerVec.mulS(this.maxSpeed);
            steerVec = steerVec.subV(this.vel);
            if (steerVec.length() > this.maxSteer) {
                //limit the steerVec magnitude!
                steerVec.normalize();
                steerVec = steerVec.mulS(this.maxSteer);
            }
        }

        this.acc = steerVec;
    }
}

Boid.prototype.steer = function (targetVector_, slowDownBool_) {
    var steering = new Vec2(0, 0); //vector that will be added to acc to steer toward target

    var desiredVel = new Vec2(0, 0);
    desiredVel = targetVector_.subV(this.pos);

    var targetDist = 0;
    targetDist = desiredVel.length();

    if (targetDist > 0) {
        desiredVel.normalize();

        if (slowDownBool_ && targetDist < 100) {
            desiredVel = desiredVel.mulS(this.maxSpeed * (targetDist / 100));
        }
        else {
            desiredVel = desiredVel.mulS(this.maxSpeed);
        }

        steering = desiredVel.subV(this.vel);
        if (steering.length() > this.maxSteer) {
            steering.normalize();
            steering = steering.mulS(this.maxSteer);
        }
    }
    else {
        //do nothing --> steering = (0,0)
    }
    return steering;
}

Boid.prototype.run = function (boidArray_) {
    this.maxSpeed = speedVar;
    this.update(boidArray_);
    this.canvasEdge();
    this.draw();
}

Boid.prototype.update = function (boidArray_) {

    var sep = new Vec2(0, 0);
    sep = this.separation(boidArray_);
    sep = sep.mulS(2);
    this.acc = this.acc.addV(sep);

    var align = new Vec2(0, 0);
    align = this.alignment(boidArray_);
    this.acc = this.acc.addV(align);

    var coh = new Vec2(0, 0);
    coh = this.cohesion(boidArray_);
    this.acc = this.acc.addV(coh);

    if(drawObj == 1){
        if(objType == 0){
            this.attract(new Vec2(objPos.x, objPos.y));
        }
        if(objType == 1){
            this.detract(new Vec2(objPos.x, objPos.y));
        }
    }

    this.vel = this.vel.addV(this.acc);
    if (this.vel.length() > this.maxSpeed) {
        this.vel.normalize();
        this.vel = this.vel.mulS(this.maxSpeed);
    }

    this.pos = this.pos.addV(this.vel);
    this.acc = this.acc.mulS(0);

}
Boid.prototype.canvasEdge = function () {
    //so that the boids wrap around the canvas edges
    if (this.pos.x < -this.size) { this.pos.x = canvasWidth + this.size; }
    if (this.pos.y < -this.size) { this.pos.y = canvasHeight + this.size; }
    if (this.pos.x > canvasWidth + this.size) { this.pos.x = -this.size; }
    if (this.pos.y > canvasHeight + this.size) { this.pos.y = -this.size; }
}
Boid.prototype.draw = function () {
    var horizVec = new Vec2(1, 0);
    var directionVec = new Vec2(this.vel.x, this.vel.y);
    directionVec.normalize();

    var angle = 0;
    angle = Math.acos(horizVec.dot(directionVec));

    //setTransform (scaleH, skewH, skewV, scaleV, moveX, moveY)
    ctx.setTransform(1, 0, 0, 1, this.pos.x, this.pos.y);
    if (directionVec.y > 0) {
        ctx.rotate(angle);
    }
    else {
        ctx.rotate(-angle);
    }

    ctx.fillStyle = "#00A1D9";
    ctx.fillRect(0, 0, this.size, 3);
}
//Boids Class End   ---------------------------------------------------


//Vector --------------------------------------------------------------
/*
Common vector operations
Author: Tudor Nita | cgrats.com
Version: 0.51

*/
function Vec2(x_, y_) {
    this.x = x_;
    this.y = y_;
}

/* vector * scalar */
Vec2.prototype.mulS = function (value) { return new Vec2(this.x * value, this.y * value); }
/* vector * vector */
Vec2.prototype.mulV = function (vec_) { return new Vec2(this.x * vec_.x, this.y * vec_.y); }
/* vector / scalar */
Vec2.prototype.divS = function (value) { return new Vec2(this.x / value, this.y / value); }
/* vector + scalar */
Vec2.prototype.addS = function (value) { return new Vec2(this.x + value, this.y + value); }
/* vector + vector */
Vec2.prototype.addV = function (vec_) { return new Vec2(this.x + vec_.x, this.y + vec_.y); }
/* vector - scalar */
Vec2.prototype.subS = function (value) { return new Vec2(this.x - value, this.y - value); }
/* vector - vector */
Vec2.prototype.subV = function (vec_) { return new Vec2(this.x - vec_.x, this.y - vec_.y); }
/* vector absolute */
Vec2.prototype.abs = function () { return new Vec2(Math.abs(this.x), Math.abs(this.y)); }
/* dot product */
Vec2.prototype.dot = function (vec_) { return (this.x * vec_.x + this.y * vec_.y); }
/* vector length */
Vec2.prototype.length = function () { return Math.sqrt(this.dot(this)); }
/* vector length, squared */
Vec2.prototype.lengthSqr = function () { return this.dot(this); }
/*
vector linear interpolation
interpolate between two vectors.
value should be in 0.0f - 1.0f space
*/
Vec2.prototype.lerp = function (vec_, value) {
    return new Vec2(this.x + (vec_.x - this.x) * value, this.y + (vec_.y - this.y) * value);
}
/* normalize THIS vector */
Vec2.prototype.normalize = function () {
    var vlen = this.length();
    this.x = this.x / vlen;
    this.y = this.y / vlen;
}