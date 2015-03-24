var Screen = require('./screen');

// A block represents one cell of the game grid
var Block = function (xPos, yPos) {
    'use strict';

    var block = {
        x: xPos,
        y: yPos,

        draw: function () {
            this.drawCell(this.x, this.y);
        },
        move: function (direction) {

            switch (direction) {
                case 'right':
                    this.x++;
                    break;
                case 'left':
                    this.x--;
                    break;
                case 'down':
                    this.y++;
                    break;
                case 'up':
                    this.y--;
                    break;
            }
        },
        samePosition: function (block) {
            return this.x === block.x && this.y === block.y;
        },
        withinBounds: function (minX, minY, maxX, maxY) {
            return (this.x >= minX && this.y >= minY && this.x < maxX && this.y < maxY);
        }
    };

    // "extend" with the screen closure methods
    _.extend(block.constructor.prototype, Screen.getInstance());

    return block;

};

module.exports = Block;