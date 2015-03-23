module.exports = function(xPos, yPos) {
  'use strict';

    return {
        x: xPos,
        y: yPos,

        draw: function (canvasCtx, blockSize) {
            canvasCtx.fillStyle = "#FF0000";  // Red
            canvasCtx.fillRect(this.x * blockSize, this.y * blockSize,
                blockSize, blockSize);

            canvasCtx.beginPath(); //
            canvasCtx.fillStyle = "#000000";
            canvasCtx.rect(this.x * blockSize, this.y * blockSize,
                blockSize, blockSize);
            canvasCtx.stroke();

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
                    this.y++
                    break;
                case 'up':
                    this.y--;
                    break;
            }
        },
        samePosition: function(block) {
            return this.x === block.x && this.y === block.y;
        },
        withinBounds : function(minX, minY, maxX, maxY) {
            return (this.x >= minX && this.y >= minY && this.x < maxX && this.y < maxY);
        }
    }
};