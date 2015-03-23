
var Block = require('./block');

module.exports = function () {

    'use strict';

    var INITIAL_SNAKE_LENGTH = 3;
    var DEFAULT_DIRECTION = 'up';

    var direction = DEFAULT_DIRECTION;
    var pendingDirection = DEFAULT_DIRECTION;
    var blocks = [];
    var gridDim;
    var newBlockRequested = false;

    function reset() {
        direction = DEFAULT_DIRECTION;
        pendingDirection = DEFAULT_DIRECTION;
        var blockY = Math.trunc(gridDim.numRows / 2);
        var blockX = Math.trunc(gridDim.numCols / 2);
        blocks = _(INITIAL_SNAKE_LENGTH).times(function() {
           return Block(blockX, blockY++);
        });
    }

    function setScreenDim(newGridDim) {
        gridDim = newGridDim;
    }

    function draw(canvasCtx) {
        _.each(blocks, function(block) {
            block.draw(canvasCtx, gridDim.cellSize);
        });
    }

    function setDirection(newDirection) {

        // Maker sure it's a legal direction. Can't backup over yourself.
        var allowableDirections = getAllowableDirections();

        if(_.contains(allowableDirections, newDirection)) {
            pendingDirection = newDirection;
        }
    }

    function isTooClose(block, minSafeDistance) {

        minSafeDistance = minSafeDistance || 5;

       // calc a perimeter around the block
       var perimeter = {
          minX : (block.x - minSafeDistance),
          maxX : (block.x + minSafeDistance),
          minY : (block.y - minSafeDistance),
          maxY : (block.y + minSafeDistance)
       }

      // do any of the snake blocks intersect the perimeter?
      var intersect = _.find(blocks, function(b) {
          if(b.x >= perimeter.minX && b.x <= perimeter.maxX && b.y >= perimeter.minY && b.y <= perimeter.maxY) {
              return true;
          }
      })

      return intersect;
    }

    function advance() {
        // put the end block at the start of the list with the coords
        //  of the next location.

        // pickup any direction changes
        if(direction !== pendingDirection) {
            direction = pendingDirection;
        }

        var newBlock;
        if(newBlockRequested) {
           // when the snake eats the goal block it will get longer
           newBlock = Block();
           newBlockRequested=false;
        } else {
            // otherwise we'll move the tail to the new head location
            newBlock = blocks.pop();
        }


        // replace the xy of the new block to the current head
        var head = _.first(blocks);
        newBlock.x = head.x;
        newBlock.y = head.y;

        switch (direction) {
            case 'right':
                newBlock.x++;
                break;
            case 'left':
                newBlock.x--;
                break;
            case 'down':
                newBlock.y++;
                break;
            case 'up':
                newBlock.y--;
                break;
        }


        // insert the block to the front of the list
        blocks.unshift(newBlock);
    }

    function collisionDetected() {
        var head = _.first(blocks);

        // fail the game if the lead block is off the game area
        if(!head.withinBounds(0,0,gridDim.numCols, gridDim.numRows)) {
            return true;
        }

        // fail if the snake runs into itself
        for (var i = 1; i < blocks.length; i++) {
            if(head.samePosition(blocks[i])) {
                return true;
            }
        }
    }

    function ateBlock(block) {
        // did we eat the goal block?
        return _.first(blocks).samePosition(block);
    }


    function addBlock() {
        newBlockRequested = true;
    }


    function getAllowableDirections() {

        // The snake cannot backup over itself
        switch (direction) {
            case 'right':
            case 'left':
                return ['up', 'down'];
                break;
            case 'down':
            case 'up':
                return ['left', 'right'];
                break;
        }

    }


    return {
        reset:reset,
        draw: draw,
        advance: advance,
        setDirection: setDirection,
        setScreenDim: setScreenDim,
        collisionDetected: collisionDetected,
        ateBlock:ateBlock,
        addBlock:addBlock,
        isTooClose:isTooClose
    };
};




