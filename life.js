'use strict';

var timeDiff = 100;
var message = "hello";

var gridSize = 24;
var maxX = Math.floor(600 / gridSize);
var maxY = Math.floor(400 / gridSize);
var cell = null;
var neighbors = null;
var cksum1 = 0;
var cksum2 = 0;
var cksum3 = 0;

var startButton = null;
var clearButton = null;

var running = false;



function addNeighbor(x, y) {
    if (x>=0 && x<maxX && y>=0 && y<maxY) {
        neighbors[x][y] = neighbors[x][y] + 1;
    }
}

function clearCells() {
    for (var x=0; x<maxX; x++) {
        for (var y=0; y<maxY; y++) {
            cell[x][y] = false;
        }
    }
    message = "0";
    running = false;
    startButton.label='Start';
    cksum1 = 0;
    cksum2 = 0;
    cksum3 = 0;
}

function calculateElementPosition(element) {
    if (element.positionLeft || element.positionTop) {
        return;
    }
    element.positionLeft = element.offsetLeft;
    element.positionTop = element.offsetTop;
    if (element.offsetParent) {
        calculateElementPosition(element.offsetParent);
        element.positionLeft += element.offsetParent.positionLeft;
        element.positionTop += element.offsetParent.positionTop;
    }
}

function calculatePosition(event, element) {
    if (event.localX || event.localY) {
        // Already calculated
    } else if (event.pageX || event.pageY) {
        event.localX = event.pageX - element.positionLeft;
        event.localY = event.pageY - element.positionTop;
    } else if (event.clientX || event.clientY) {
        event.localX = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft - element.positionLeft;
        event.localY = event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop - element.positionTop;
    }
}

function handleMousedown(event) {
    var canvas = document.getElementById('canvas');
    calculatePosition(event, canvas);
    message = "";
    if (startButton.inside(event)) {
        startButton.selected = true;
        return;
    }
    if (clearButton.inside(event)) {
        clearButton.selected = true;
        return;
    }
    var x = Math.floor((event.localX - 20) / gridSize);
    if (x < 0 || x >= maxX) { return; }
    var y = Math.floor((event.localY - 20) / gridSize);
    if (y < 0 || y >= maxY) { return; }
    cell[x][y] = ! cell[x][y];
}

function handleMouseup(event) {
    var canvas = document.getElementById('canvas');
    calculatePosition(event, canvas);
    message = "";
    if (startButton.inside(event)) {
        running = ! running;
        startButton.label = running ? 'Stop' : 'Start';
        startButton.selected = false;
        cksum1 = 0;
        cksum2 = 0;
        cksum3 = 0;
        return;
    }
    if (clearButton.inside(event)) {
        clearCells();
        clearButton.selected = false;
        return;
    }
}

function Button(xx, yy, s) {
    this.x = xx;
    this.y = yy;
    this.width = 60;
    this.height = 28;
    this.label = s;
    this.selected = false;
}

Button.prototype.draw = function(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgb(180, 180, 180)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y+2);
    ctx.lineTo(this.x+2, this.y);
    ctx.lineTo(this.x+this.width-2, this.y);
    ctx.lineTo(this.x+this.width, this.y+2);
    ctx.lineTo(this.x+this.width, this.y+this.height-2);
    ctx.lineTo(this.x+this.width-2, this.y+this.height);
    ctx.lineTo(this.x+2, this.y+this.height);
    ctx.lineTo(this.x, this.y+this.height-2);
    ctx.lineTo(this.x, this.y+2);
    ctx.stroke();
    if (this.selected) {
        ctx.fillStyle = 'rgb(180,180,180)';
        ctx.fillRect(this.x+1, this.y+1, this.width-2, this.height-2);
        ctx.strokeStyle = 'rgb(0, 0, 0)';
    }
    ctx.strokeText(this.label, this.x+6, this.y+this.height-6);
    ctx.restore();
}

Button.prototype.inside = function(event) {
    if (event.localY < this.y) { return false; }
    if (event.localY > this.y+this.height) { return false; }
    if (event.localX < this.x) { return false; }
    if (event.localX > this.x+this.width) { return false; }
    return true;
}

function generation() {
    for (var xx=0; xx<maxX; xx++) {
        for (var yy=0; yy<maxY; yy++) {
            neighbors[xx][yy] = 0;
        }
    }
    for (var x=0; x<maxX; x++) {
        for (var y=0; y<maxY; y++) {
            if (cell[x][y]) {
                addNeighbor(x-1,y-1);
                addNeighbor(x,y-1);
                addNeighbor(x+1,y-1);
                addNeighbor(x-1,y);
                addNeighbor(x+1,y);
                addNeighbor(x-1,y+1);
                addNeighbor(x,y+1);
                addNeighbor(x+1,y+1);
            }
        }
    }
    var checksum = 0;
    var count = 0;
    var prime = 31;
    for (var x2=0; x2<maxX; x2++) {
        var rowChecksum = 0;
        for (var y2=0; y2<maxY; y2++) {
            cell[x2][y2] = (neighbors[x2][y2]==3) || (cell[x2][y2] && neighbors[x2][y2]==2);
            if (cell[x2][y2]) {
                count++;
                rowChecksum++;
            }
            rowChecksum *= 2;
        }
        checksum = checksum * prime + (rowChecksum*x);
    }
    message = "" + count;
    var done = (checksum==cksum1) || (checksum==cksum2) || (checksum==cksum3);
    cksum3 = cksum2;
    cksum2 = cksum1;
    cksum1 = checksum;
    if (count === 0 || done) {
        running = false;
        startButton.label='Start';
    }
    return checksum;
}

function draw()
{
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.save();

    ctx.fillStyle = 'rgb(51, 51, 51)';
    ctx.fillRect(0, 0, 320, 460);

    ctx.fillStyle='white';
    for (var x=0; x<maxX; x++) {
        for (var y=0; y<maxY; y++) {
            if (cell[x][y]) {
                ctx.fillRect(20+x*gridSize, 20+y*gridSize, gridSize, gridSize);
            }
        }
    }

    ctx.strokeStyle = 'rgb(40, 40, 40)';
    ctx.beginPath();
    for (var j=0; j<=maxY; j++) {
        ctx.moveTo(20, 20+j*gridSize);
        ctx.lineTo(20+maxX*gridSize, 20+j*gridSize);
    }
    for (var i=0; i<=maxX; i++) {
        ctx.moveTo(20+i*gridSize, 20);
        ctx.lineTo(20+i*gridSize, 20+maxY*gridSize);
    }
    ctx.stroke();


    ctx.strokeStyle = 'rgb(77, 77, 77)';
    ctx.strokeText(message, canvas.width - 60, canvas.height-10);

    startButton.draw(ctx);
    clearButton.draw(ctx);

    ctx.restore();
    if (running) {
        generation();
    }
}

function setup()
{
    var canvas = document.getElementById('canvas');
    calculateElementPosition(canvas);
    canvas.addEventListener('mousedown', handleMousedown, false);
    canvas.addEventListener('mouseup', handleMouseup, false);
    maxX = Math.floor((canvas.width-40) / gridSize);
    maxY = Math.floor((canvas.height-60) / gridSize);
    message = '[' + maxX + ',' + maxY + ']  ' + canvas.width + ',' + canvas.height;

    cell = new Array(maxX);
    neighbors = new Array(maxX);
    for (var x=0; x<maxX; x++) {
        cell[x] = new Array(maxY);
        neighbors[x] = new Array(maxY);
    }

    startButton = new Button(20, canvas.height-40, 'Start');
    clearButton = new Button(100, canvas.height-40, 'Clear');

    clearCells();

    draw();
    setInterval(draw,timeDiff);
}
