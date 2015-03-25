/*
 The SnakeGame orchestrates the game rules. It keeps score and decides how often to paint the canvas. It also
 takes in the keyboard, mouse and touch events for user input.


 The game loop is a state machine with the following game states:
 - gameLoading: initializing...
 - gameReady: Game board is drawn and ready to play
 - gameRunning: User is playing a game
 - gamePaused: Game is paused
 - gameOver: Game is over
 */

var Snake = require('./snake');
var Block = require('./block');
var BrowserDetect = require('./browserdetect');
var Screen = require('./screen');

var SnakeGame = function () {

    'use strict';


    // game board refresh rate
    var DEFAULT_FPS = 10;
    var fps = DEFAULT_FPS;

    // key for storing the hi-score in local storage.
    var highScoreLocalStorageKey = 'snakegame.highscore';

    // user snake properties
    var snake;
    var userSnakeColor = '#FFFF00';

    // robot snake properties
    var robotSnake;
    var robotSnakeEnabled = false;
    var robotSnakeScoreThreshold = 5;  // release the robot snake when score exceeds this value.
    var robotSnakeColor = '#FF0000';

    // this block is the apple that the snake is chasing
    var goalBlock;

    // state of the game state machine (game states above)
    var state = 'gameLoading';

    // scoring stats
    var currentScore = 0;
    var highScore = 0;

    var browserDetect;

    // some game sounds
    var gameOverSound;
    var ateBlockSound;

    var fontSizes = {
        large: 40,
        medium: 28,
        small: 16
    };

    function init() {

        browserDetect = BrowserDetect.getInstance();
        snake = Snake(userSnakeColor);
        robotSnake = Snake(robotSnakeColor, true);

        // Restart the game if the screen size changes. Need to re-calc the grid
        window.addEventListener('resize', restartGame, false);
        window.addEventListener('orientationchange', restartGame, false);

        // load the previous high score from local storage if exists.
        highScore = loadNumberFromStorage(highScoreLocalStorageKey);

        // Load some really lame sounds
        gameOverSound = new Audio("./media/pacman_death.wav");
        ateBlockSound = new Audio("./media/pacman_wakka.wav");

        // Start the game.
        restartGame();
    }

    // Restart the game, reset everything back to the original values (except for hi-score)
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

    // Main game loop. This requests an animation frame every ~100ms on a specific delay. As the game progresses the
    // animation loop will run faster. The setTimeout only runs when the gameloop is serviced by the browser so it
    // is efficient and won't run when it's in the background.
    function gameLoop() {

        // if we are getting ready to start a new game, then just draw once.
        switch (state) {
            case 'gameLoading':
                doGameLoading();
                break;
            case 'gamePaused':
            case 'gameReady':
                break;
            case 'gameRunning':
                setTimeout(function () {
                    requestAnimationFrame(gameLoop);
                    updateGameBoard();
                }, 1000 / fps);
                break;
            case 'gameOver':
                doGameOver();
                break;
        }
    }

    // Do what we need to do to load the game.
    function doGameLoading() {
        updateGameBoard(true);
        updateScoreDisplay();
        drawStartGameMessage();
        state = 'gameReady';
    }


    // Logic when the game is over.
    function doGameOver() {

        gameOverSound.play();
        updateScoreDisplay();
        drawGameOverMessage();

        // update the high score and save to local storage
        highScore = Math.max(highScore, currentScore);
        saveToStorage(highScoreLocalStorageKey, highScore);
    }

    function checkCollision() {
        // Check to see if the head of either snake overlaps
        // any of the robot snake pieces.
        if (robotSnakeEnabled &&
            (robotSnake.intersects(snake.getHead()) ||
            snake.intersects(robotSnake.getHead()))) {
            return true;
        }

        return snake.collisionDetected();
    }


    function addBlockToSnakes() {
        snake.addBlock();

        if (robotSnakeEnabled) {
            robotSnake.addBlock();
        }
    }

    function advanceSnakes() {
        snake.advance();

        if (robotSnakeEnabled) {
            robotSnake.advance();
        }

    }

    // Randomly move the "goal block" or apple around the game board.
    // Make sure it's not too close the snake or the walls.
    function moveGoalBlock() {

        // Create the goal block
        if (!goalBlock) {
            goalBlock = Block(0, 0);
            goalBlock.spriteName = 'apple';
        }

        // Find a new space for the goal block that is not too close to the snake
        setRandomBlockLocation(goalBlock);
        // try 5 times to find an acceptable loc for the apple
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

    // Update the scoreboard above the game area
    function updateScoreDisplay() {
        $('#currentScore').text(currentScore);
        $('#highScore').text(highScore);
    }


    // Draw the game board and all the components. It's is called in the animation loop.
    function updateGameBoard(init) {

        if (!init) {
            advanceSnakes();
            if (checkCollision()) {
                state = 'gameOver';
                return;
            } else if (snake.ateBlock(goalBlock)) {
                // we ate a block so update the score and move it somewhere else.
                ateBlockSound.play();
                currentScore++;
                updateScoreDisplay();
                addBlockToSnakes();
                robotSnakeEnabled = (currentScore >= robotSnakeScoreThreshold);
                fps++; // speed up the game
                moveGoalBlock();
            }
        }

        // Refresh the game area
        clearCanvas();

        if (!init) {
            goalBlock.draw();
        }
        snake.draw();

        if (robotSnakeEnabled) {
            robotSnake.draw();
        }
    }


    function drawStartGameMessage() {

        // The messaging should change depending on if we're a touch device or not.
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
            yOffset += 25;
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


    // utility method to test for intersection
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

        // if we're ready to start, then a up,left, or right arrow press will get the game started.
        if (state === 'gameReady') {
            if (direction !== 'down') {
                state = 'gameRunning';
                snake.setDirection(direction);
                gameLoop();
            }
        } else if (state === 'gameRunning') {
            // if we're already running, then go that direction
            snake.setDirection(direction);
        }
    }

    // utility method to pull a value from local storage
    function loadNumberFromStorage(key) {
        var valNum = 0;
        if (browserDetect.supportsLocalStorage()) {
            var storageValue = localStorage.getItem(key);
            if (storageValue) {
                valNum = Number(storageValue);
            }
        }
        return valNum;
    }

    // save a value to local storage
    function saveToStorage(key, value) {
        if (browserDetect.supportsLocalStorage()) {
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

