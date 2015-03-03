"use strict"
var width = 600;
var height = 400;
var ctx, canvas;
var speed;

var x = Math.ceil(width/20) * 10;
var y = Math.ceil(height/20) * 10;

var length = 10;
var snakes = [];
var crashList = [];
var apples = [];

var eatingSound = new Audio("slurp.wav");

function drawRect(x, y, colour){
  ctx.fillStyle = colour;
  ctx.fillRect(x+1, y+1, 8, 8);
}
function updateScore(snakes){
    for (var i = 0; i < snakes.length; i++){
        document.getElementById(("player"+(i+1))).innerHTML = snakes[i].points;
    }
}

function Snake(x, y, length, colour, keyset) {
  this.x = x;
  this.y = y;
  this.dir_x = 0;
  this.dir_y = 10;
  this.length = length;
  this.points = 0;
  this.body = [];
  this.headColour = colour;
  this.bodyColour = colour;
  this.crashed = false;
  this.pause = false;
  this.dead = false;
  this.keyset = keyset;
  this.infected = 0;

  document.addEventListener("keydown", function (event){
    switch (event.keyCode) {
      case this.keyset[0]: // W key - up
        if (this.dir_y <= 0){
          this.dir_x = 0;
          this.dir_y = -10;
        }
        break;
      case this.keyset[1]: // A key - left
        if (this.dir_x <= 0){
          this.dir_x = -10;
          this.dir_y = 0;
        }
        break;
      case this.keyset[2]: // S key - down
        if (this.dir_y >= 0){
          this.dir_x = 0;
          this.dir_y = 10;
        }
        break;
      case this.keyset[3]: // D key - right
        if (this.dir_x >= 0){
          this.dir_x = 10;
          this.dir_y = 0;
        }
        break;
    }
  }.bind(this));
}
Snake.prototype.move = function (){
    if (!this.dead){
  this.x += this.dir_x;
  this.y += this.dir_y;

  this.crashed = this.check_crashed(this.body);
  this.body.unshift({x: this.x,y: this.y});
  if (this.body.length > this.length){
    this.body.pop();
  }
  this.draw();
  }
};
Snake.prototype.check_crashed = function (){
    var bodylist;
    if (this.x < 0 || this.x >= width || this.y < 0 || this.y >= height){
      return true;
    }
    for (var i = 0; i < crashList.length; i++){
        bodylist = crashList[i];

        for (var i = 0; i < bodylist.length; i++){
            if (bodylist[i].x == this.x && bodylist[i].y == this.y){
                return true;
            }
        }
    }
    bodylist = this.body;
    for (var i = 0; i < bodylist.length; i++){
        if (bodylist[i].x == this.x && bodylist[i].y == this.y){
            return true;
        }
    }
    return false;
};
Snake.prototype.keyReverse = function (){
    var tempKeys = this.keyset.slice();
    this.keyset[0] = tempKeys[2];
    this.keyset[1] = tempKeys[3];
    this.keyset[2] = tempKeys[0];
    this.keyset[3] = tempKeys[1];
};
Snake.prototype.eat = function (apple){
  // Play eating sound
  if (this.x == apple.x && this.y == apple.y){
      // You eat the apple
      if (apple.isRotten){
          if (apple.bonus == 0){
              this.keyReverse();
          }
          else if (apple.bonus == 1){
              this.infected = 100;
              //this.headColour = "#ea0d0d";
              //this.bodyColour = "#FFFFFF";
          }
      }
      (new Audio("slurp.wav")).play();
      this.length += 5;
      this.points = (this.length - 10) / 5;
      console.log("You ate apples for a value of ", this.points);
      apple.eaten = true;
  }
};
Snake.prototype.die = function (){
    this.bodyColour = this.headColour;
    this.draw();
    (new Audio("die_2.wav")).play();
    this.dead = true;
};
Snake.prototype.draw = function (){
    if (this.infected > 0){
        this.infected--;
        if (this.infected % 10 == 0){
            drawRect(this.body[0].x, this.body[0].y, this.headColour);
            for (var i = 1; i < this.body.length; i++){
              drawRect(this.body[i].x, this.body[i].y, this.bodyColour);
            }
        }
    }
    else {
    drawRect(this.body[0].x, this.body[0].y, this.headColour);
  for (var i = 1; i < this.body.length; i++){
    drawRect(this.body[i].x, this.body[i].y, this.bodyColour);
  }
  if (this.crashed){
    drawRect(this.x, this.y, "red");
  }
  }
};


function Apple(colour, isRotten, bodylists){
  this.x;
  this.y;
  this.colour = colour;
  this.eaten = false;
  this.bonus = parseInt(Math.random()*2);
  this.isRotten = isRotten || false;
  this.place(bodylists);
}
Apple.prototype.place = function (bodylists){
  var x, y;
  var colliding = true;
  while (colliding){
    x = Math.ceil(Math.random()*width/10)*10;
    y = Math.ceil(Math.random()*height/10)*10;
    colliding = false;
    for (var j = 0; j < bodylists; j++){
        var bodylist = bodylists[j];
        for (var i = 0; i < bodylist.length; i++){
            if (bodylist[i].x == x && bodylist[i].y == y){
                colliding = true;
            }
        }
    }
  }
  this.x = x;
  this.y = y;
};
Apple.prototype.draw = function (){
  drawRect(this.x, this.y, this.colour);
};

function gameloop(interval){
    var bodylists = [];
    updateScore(snakes);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < snakes.length; i++){
      snakes[i].move();
      snakes[i].draw();
      bodylists.push(snakes[i].body);
    }
    for (var i = 0; i < apples.length; i++){
      if (apples[i].eaten){
          apples[i] = new Apple("#66CD00", apples[i].isRotten, bodylists);
      }
    }
    for (var i = 0; i < apples.length; i++){
      apples[i].draw();
    }
    var allDead = true;
    for (var i = 0; i < snakes.length; i++){
        for (var j = 0; j < apples.length; j++){
            snakes[i].eat(apples[j]);
        }
      snakes[i].check_crashed();
      if (snakes[i].crashed){
          snakes[i].die();
          console.log("Player ",i,"died");
      }
      else {
          allDead = false;
      }
    }
    if (allDead){
        if (typeof interval !== "undefined"){
          clearInterval(interval);
        }
    }
}

document.addEventListener("DOMContentLoaded", function(){
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  snakes.push(new Snake(x-20, y, length, "#999CCC", [38, 37, 40, 39]));
  //snakes.push(new Snake(x+20, y, length, "#9911CC", [121, 103, 104, 106]));
  //snakes.push(new Snake(x-60, y, length, "#FF00F7", [108, 44, 46, 45]));
  for (var i = 0; i < 100; i++){
      apples.push(new Apple("#66CD00", parseInt(Math.random()*2), []))
  }
  var loop_id;
  loop_id = setInterval(function () {gameloop(loop_id)}, 60);
});
