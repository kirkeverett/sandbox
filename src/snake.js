var Block = require('./block');
var Screen = require('./screen');

// The snake is essentially a collection of Blocks. It can be advanced
//  around the screen one block at a time.
var Snake = function (blockColor, robot) {

        'use strict';

        var INITIAL_SNAKE_LENGTH = 3;
        var DEFAULT_DIRECTION = 'up';

        var direction = DEFAULT_DIRECTION;
        var pendingDirection = DEFAULT_DIRECTION;
        var blocks = [];
        var newBlockRequested = false;
        var robotMode = robot;  // is this a robot snake (randomly turn on it's own)
        var robotTurnInterval = _.random(2, 6); // randomly turn every 2-6 moves.
        var blockFillColor = blockColor;

        // Reset the snake so it can be used again for a new game.
        function reset() {
            direction = DEFAULT_DIRECTION;
            pendingDirection = DEFAULT_DIRECTION;
            var blockY = Math.trunc(getScreenGridDim().numRows / 2);
            var blockX = Math.trunc(getScreenGridDim().numCols / 2);
            blocks = _(INITIAL_SNAKE_LENGTH).times(function () {
                return Block(blockX, blockY++, blockFillColor);
            });
        }

        // draw the snake
        function draw() {
            _.each(blocks, function (block) {
                block.draw();
            });
        }

        // change the direction of the snake. illegal turns will be ignored.
        function setDirection(newDirection) {

            // Maker sure it's a legal direction. Can't backup over yourself.
            var allowableDirections = getAllowableDirections();

            if (_.contains(allowableDirections, newDirection)) {
                pendingDirection = newDirection;
            }
        }

        // is the block "too close" to the snake?
        function isTooClose(block, minSafeDistance) {

            minSafeDistance = minSafeDistance || 5;

            // calc a perimeter around the block
            var perimeter = {
                minX: (block.x - minSafeDistance),
                maxX: (block.x + minSafeDistance),
                minY: (block.y - minSafeDistance),
                maxY: (block.y + minSafeDistance)
            };

            // do any of the snake blocks intersect the perimeter?
            return _.find(blocks, function (b) {
                if (b.x >= perimeter.minX && b.x <= perimeter.maxX && b.y >= perimeter.minY && b.y <= perimeter.maxY) {
                    return true;
                }
            })
        }

        // Advance the snake one cell forward
        function advance() {
            // put the end block at the start of the list with the coords
            //  of the next location.

            // randomly turn the robot snake every x advances.
            if (robotMode && (isOnPerimeter() || (--robotTurnInterval === 0))) {
                pendingDirection = getRandomNewDirection();
                robotTurnInterval = _.random(5, 10);
            }

            // pickup any direction changes
            if (direction !== pendingDirection) {
                direction = pendingDirection;
            }

            var newBlock;
            if (newBlockRequested) {
                // when the snake eats the goal block it will get longer
                newBlock = Block(0, 0, blockFillColor);
                newBlockRequested = false;
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

        // Is the snake head block on the perimeter of the game area.
        function isOnPerimeter() {
            var head = _.first(blocks);
            var dim = getScreenGridDim();
            return (head.x === 0 || head.y === 0 || head.x === dim.numCols - 1 || head.y === dim.numRows - 1);
        }

        // Did the snake hit the game perimeter or itself?
        function collisionDetected() {
            var head = _.first(blocks);

            // fail the game if the lead block is off the game area
            var dim = getScreenGridDim();
            if (!head.withinBounds(0, 0, dim.numCols, dim.numRows)) {
                return true;
            }

            // fail if the snake runs into itself
            for (var i = 1; i < blocks.length; i++) {
                if (head.samePosition(blocks[i])) {
                    return true;
                }
            }
        }

        // Did the snake eat a block?
        function ateBlock(block) {
            // did we eat the goal block?
            return _.first(blocks).samePosition(block);
        }


        // Request a new block being added. It will be added during the next "advance"
        function addBlock() {
            newBlockRequested = true;
        }

        // random allowable direction for the robot mode.
        function getRandomNewDirection() {
            var dirs = getAllowableDirections();
            return dirs[_.random(0, dirs.length - 1)];
        }

        // Based on our current direction, what directions could we change to?
        function getAllowableDirections() {

            if (robotMode) {
                // We need to force turn the snake when it gets on the perimeter
                var possibleDirs = getSnakeForceTurnDirections();

                if (possibleDirs) {
                    return possibleDirs;
                }

            }

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

        // This function makes sure the robot snake does not go off the board. The allowable turns will be dependent
        // on the current location of the snake.
        function getSnakeForceTurnDirections() {
            var head = _.first(blocks);

            if (head.isAtTopLeft()) {
                // upper left corner
                switch (direction) {
                    case 'left':
                        return ['down'];
                        break;
                    case 'up':
                        return ['right'];
                        break;
                }
            } else if (head.isAtLowerLeft()) {
                // lower left corner
                switch (direction) {
                    case 'left':
                        return ['up'];
                        break;
                    case 'down':
                        return ['right'];
                        break;
                }
            } else if (head.isAtUpperRight()) {
                // upper right corner
                switch (direction) {
                    case 'right':
                        return ['down'];
                        break;
                    case 'up':
                        return ['left'];
                        break;
                }
            } else if (head.isAtLowerRight()) {
                // lower right corner
                switch (direction) {
                    case 'right':
                        return ['up'];
                        break;
                    case 'down':
                        return ['left'];
                        break;
                }
            } else if (head.onLeftWall()) {
                // somewhere on the left wall
                switch (direction) {
                    case 'up':
                    case 'down':
                        return ['right'];
                        break;
                    case 'left':
                        return ['up', 'down'];
                        break;
                }
            } else if (head.onTopWall()) {
                // somewhere on the top wall
                switch (direction) {
                    case 'left':
                    case 'right':
                        return ['down'];
                        break;
                    case 'up':
                        return ['right', 'left'];
                        break;
                }
            } else if (head.onBottomWall()) {
                // somewhere on the bottom wall
                switch (direction) {
                    case 'left':
                    case 'right':
                        return ['up'];
                        break;
                    case 'down':
                        return ['right', 'left'];
                        break;
                }
            } else if (head.onRightWall()) {
                // somewhere on the right wall
                switch (direction) {
                    case 'up':
                    case 'down':
                        return ['left'];
                        break;
                    case 'right':
                        return ['up', 'down'];
                        break;
                }
            }
        }


        function getHead() {
            return _.first(blocks);
        }

        function intersects(block) {
            // does the specified block occupy the same position of any snake blocks
            return _.find(blocks, function (b) {
                return b.samePosition(block);
            })
        }


        var snake = {
            reset: reset,
            draw: draw,
            advance: advance,
            setDirection: setDirection,
            collisionDetected: collisionDetected,
            ateBlock: ateBlock,
            addBlock: addBlock,
            isTooClose: isTooClose,
            getHead: getHead,
            intersects: intersects
        };

        // "extend" with the screen closure methods
        _.extend(snake.constructor.prototype, Screen.getInstance());

        return snake;

    };


module.exports = Snake;



