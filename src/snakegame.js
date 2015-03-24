/*
 Game States:
 gameLoading: initializing...
 gameReady: Game board is drawn and ready to play
 gameRunning: User is playing a game
 gamePaused: Game is paused
 gameOver: Game is over

 */

var Snake = require('./snake');
var Block = require('./block');
var BrowserDetect = require('./browserdetect');
var Screen = require('./screen');

var SnakeGame = function () {

    'use strict';

    var DEFAULT_FPS = 10;
    var fps = DEFAULT_FPS;
    var highScoreLocalStorageKey = 'snakegame.highscore';

    var snake;
    var robotSnake;
    var goalBlock;
    var state = 'gameLoading';
    var currentScore = 0;
    var highScore = 0;
    var robotSnakeEnabled = false;
    var robotSnakeScoreThreshold = 5;  // release the robot snake when score exceeds this value.
    var browserDetect;
    var fontSizes = {
        large: 40,
        medium: 28,
        small: 16
    };

    function init() {

        browserDetect = BrowserDetect.getInstance();
        snake = Snake();
        robotSnake = Snake(true);

        // Restart the game if the screen size changes. Need to re-calc the grid
        window.addEventListener('resize', restartGame, false);
        window.addEventListener('orientationchange', restartGame, false);

        // load the previous high score from local storage if exists.
        highScore = loadNumberFromStorage(highScoreLocalStorageKey);

        // Draw canvas for the first time.
        restartGame();
    }

    function restartGame() {
        state = 'gameLoading';
        currentScore = 0;
        fps = DEFAULT_FPS;
        moveGoalBlock();
        snake.reset();
        robotSnakeEnabled = false;
        robotSnake.reset();
        gameLoop();
    }

    function gameLoop() {

        // if we are getting ready to start a new game, then just draw once.
        switch (state) {
            case 'gameLoading':
                drawGameBoard();
                updateScoreDisplay();
                drawStartGameMessage();
                state = 'gameReady';
                return;
            case 'gameReady':
                return;
            case 'gameRunning':
                // do nothing
                break;
            case 'gamePaused':
                return;
            case 'gameOver':
                updateScoreDisplay();
                drawGameOverMessage();
                highScore = Math.max(highScore, currentScore);
                saveToStorage(highScoreLocalStorageKey, highScore);
                return;

        }

        setTimeout(function () {
            requestAnimationFrame(gameLoop);
            advanceSnakes();
            if (checkCollision()) {
                state = 'gameOver';
            } else if (snake.ateBlock(goalBlock)) {
                currentScore++;
                updateScoreDisplay();
                addBlockToSnakes();
                robotSnakeEnabled = (currentScore >= robotSnakeScoreThreshold);
                // speed up the game
                fps++;
                moveGoalBlock();
                drawGameBoard(true);
            } else {
                drawGameBoard(true);
            }

        }, 1000 / fps);
    }

    function checkCollision() {
        // Check to see if the head of either snake overlaps
        // any of the robot snake pieces.
        if(robotSnakeEnabled &&
               (robotSnake.intersects(snake.getHead()) ||
                snake.intersects(robotSnake.getHead()))) {
            return true;
        }

        return snake.collisionDetected();
    }



    function addBlockToSnakes() {
        snake.addBlock();

        if(robotSnakeEnabled) {
           robotSnake.addBlock();
        }
    }

    function advanceSnakes() {
        snake.advance();

        if (robotSnakeEnabled) {
          robotSnake.advance();
        }

    }


    function moveGoalBlock() {

        // Create the goal block
        if (!goalBlock) {
            goalBlock = Block(0,0,'#4CBB17');
        }

        // Find a new space for the goal block that is not too close to the snake
        setRandomBlockLocation(goalBlock);
        var maxLoops = 5;  // make sure we don't infinite loop
        while (--maxLoops > 0 && snake.isTooClose(goalBlock)) {
            setRandomBlockLocation(goalBlock);
        }
    }

    function setRandomBlockLocation(block) {

        var loc = getRandomCell(true);
        block.x = loc.x;
        block.y = loc.y;
    }

    function updateScoreDisplay() {
        $('#currentScore').text(currentScore);
        $('#highScore').text(highScore);
    }

    function drawGameBoard(drawGoalBlock) {

        clearCanvas();

        if (drawGoalBlock) {
            goalBlock.draw();
        }
        snake.draw();

        if(robotSnakeEnabled) {
          robotSnake.draw();
        }
    }


    function drawStartGameMessage() {

        var msg;
        if (browserDetect.isMobile() || browserDetect.isTablet()) {
            msg = 'To begin, tap on the Right, Left, or Top';
            centerTextOnCanvas(msg, fontSizes.medium);
        } else {
            msg = 'To begin, press the Right, Left, or Up arrow';
            centerTextOnCanvas(msg, fontSizes.large);
        }

        var yOffset = 40;  // put this text under the above text
        if (!browserDetect.isMobile() && !browserDetect.isTablet()) {
            centerTextOnCanvas("Press the Space Bar to pause.", fontSizes.medium, yOffset);
            yOffset+=25;
        }

        centerTextOnCanvas("(Watch out for red robot snakes!)", fontSizes.small, yOffset);

    }


    function drawGameOverMessage() {

        var msg = "GAME OVER!";
        if (currentScore > highScore) {
            msg = "NEW HIGH SCORE!";
        }

        centerTextOnCanvas(msg, fontSizes.large);

        if (browserDetect.isMobile() || browserDetect.isTablet()) {
            msg = 'Tap anywhere to restart';
        } else {
            msg = "Press the space bar or click on the game to restart";
        }
        centerTextOnCanvas(msg, fontSizes.medium, 40);

    }

    // clicking on the game board restarts the game
    $('#gameCanvas').click(function () {
        restartGame();
    });

    // Handle the arrow key and space bar input to control the snake
    $(document).on('keydown', function (event) {
        switch (event.keyCode) {
            case 32: // space
                handleSpaceBarPress();
                break;
            case 38: // up
                handleDirectionChange('up');
                break;
            case 37: // left
                handleDirectionChange('left');
                break;
            case 39: // right
                handleDirectionChange('right');
                break;
            case 40: // down
                handleDirectionChange('down');
                break;
        }

    });


    // prevent elastic scrolling on mobile
    document.body.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, false);	// end body:touchmove


    // Respond to touch events on the mobile devices
    // Divide the screen into right/left/up/down "buttons"
    document.addEventListener('touchstart', function (e) {
        e.preventDefault();

        // restart the game if you touch anywhere on the screen
        // after the game is finished.
        if (state === 'gameOver') {
            restartGame();
            return;
        }

        var touch = e.touches[0];

        var screenDim = getScreenDimPixels();

        // convert touch coordinates to a direction

        // left button is the left-most middle third
        var leftPerimeter = {
            minY: screenDim.height / 3,
            maxY: 2 * screenDim.height / 3,
            minX: 0,
            maxX: screenDim.width / 2
        };

        // right button is the right-most middle third
        var rightPerimeter = {
            minY: screenDim.height / 3,
            maxY: 2 * screenDim.height / 3,
            minX: screenDim.width / 2,
            maxX: screenDim.width
        };

        // up and down are non-right or left presses above/below
        //  the middle of the screen.
        var point = {x: touch.pageX, y: touch.pageY};
        if (contains(rightPerimeter, point)) {
            handleDirectionChange('right');
        } else if (contains(leftPerimeter, point)) {
            handleDirectionChange('left');
        } else if (point.y <= screenDim.height / 2) {
            handleDirectionChange('up');
        } else {
            handleDirectionChange('down');
        }

    }, false);


    function contains(perimeter, point) {
        return point.x >= perimeter.minX &&
            point.x < perimeter.maxX &&
            point.y >= perimeter.minY &&
            point.y < perimeter.maxY;
    }


    // Space bar behavior depends on the game state
    function handleSpaceBarPress() {
        if (state === 'gameOver') {
            restartGame();
        } else {
            if (state === 'gamePaused') {
                state = 'gameRunning';
                gameLoop();
            } else if (state === 'gameRunning') {
                state = 'gamePaused';
            }
        }
    }

    function handleDirectionChange(direction) {

        if (state === 'gameReady') {
            if (direction !== 'down') {
                state = 'gameRunning';
                snake.setDirection(direction);
                gameLoop();
            }
        } else if (state === 'gameRunning') {
            snake.setDirection(direction);
        }
    }

    function loadNumberFromStorage(key) {
        var valNum = 0;
        if(browserDetect.supportsLocalStorage()) {
            var storageValue = localStorage.getItem(key);
            if(storageValue) {
                valNum = Number(storageValue);
            }
        }
        return valNum;
    }

    function saveToStorage(key, value) {
        if(browserDetect.supportsLocalStorage()) {
            localStorage.setItem(key, value);
        }
    }

    var snakeGame = {
        init: init
    };

    // "extend" with the screen closure methods
    _.extend(snakeGame.constructor.prototype, Screen.getInstance());

    return snakeGame;
};

module.exports = SnakeGame;

