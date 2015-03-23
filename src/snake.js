
var Block = require('./block');

module.exports = function () {

    'use strict';

    var DEFAULT_DIRECTION = 'up';

    var direction = DEFAULT_DIRECTION;
    var pendingDirection = DEFAULT_DIRECTION;
    var INITIAL_LENGTH = 3;
    var maxBlockY;
    var maxBlockX;
    var blockSize;
    var blocks = [];
    var newBlockRequested = false;

    function reset() {
        direction = DEFAULT_DIRECTION;
        pendingDirection = DEFAULT_DIRECTION;
        var blockY = Math.trunc(maxBlockY / 2);
        var blockX = Math.trunc(maxBlockX / 2);
        blocks = [];
        for (var i = 0; i <= INITIAL_LENGTH; i++) {
            blocks.push(Block(blockX, blockY));
            blockY++;
        }
    }

    function setScreenDim(newGridWidth, newGridHeight, newBlockSize) {
        maxBlockX = newGridWidth;
        maxBlockY = newGridHeight;
        blockSize = newBlockSize;
    }

    function draw(canvasCtx) {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].draw(canvasCtx, blockSize);
        }
    }

    function setDirection(newDirection) {

        // Maker sure it's a legal direction. Can't backup over yourself.
        var allowableDirections = getAllowableDirections();

        if (allowableDirections.indexOf(newDirection) !== -1) {
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
              console.log('Block: (' + block.x + ', ' + block.y + ') is too close to the snake block: (' + b.x + ', ' + b.y + ')');
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
       //     console.log("Changing to " + pendingDirection);
            direction = pendingDirection;
        }

        var newBlock;
        if(newBlockRequested) {
           newBlock = Block();
           newBlockRequested=false;
        } else {
            // get the end block (and remove it from the list)
            newBlock = blocks.pop();
        }


        // replace the xy of the new block to the current head
        var head = blocks[0];
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
        var head = blocks[0];

        // fail the game if the lead block is off the game area
        if(!head.withinBounds(0,0,maxBlockX, maxBlockY)) {
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
        return blocks[0].samePosition(block);
    }


    function addBlock() {
        newBlockRequested = true;
    }


    function getAllowableDirections() {

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

  //  init();

    return {
     //   init: init,
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




