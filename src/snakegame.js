
var Snake = require('./snake');
var Block = require('./block');
var BrowserDetect = require('./browserdetect');
var Screen = require('./screen');

module.exports = function() {

    'use strict';

/*
    States:
        gameLoading: initializing...
        gameReady: Game board is drawn and ready to play
        gameRunning: User is playing a game
        gamePaused: Game is paused
        gameOver: Game is over

*/

    var DEFAULT_FPS = 10;
    var fps = DEFAULT_FPS;

    var canvasID = 'gameCanvas';
    var gameAreaID = 'gameArea';
    var statsAreaID = 'statsArea';
    var snake;
    var goalBlock;
    var state = 'gameLoading';

    var currentScore = 0;
    var highScore = 0;

    var mediumWidthBreakPointPx = 600;
    var largeWidthBreakPointPx = 960;

    var browserDetect;
    var screen;

    var fontSizes = {
       large: 40,
       medium: 28,
       small: 16
    };

    function init() {

        // TODO inject these
        browserDetect = BrowserDetect(mediumWidthBreakPointPx, largeWidthBreakPointPx);
        screen = Screen(browserDetect, gameAreaID, statsAreaID, canvasID);
        snake = Snake();

        // Register an event listener to
        // call the resizeCanvas() function each time
        // the window is resized.
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        // Draw canvas for the first time.
        resizeCanvas();

        moveGoalBlock();


    }



    // Runs each time the DOM window resize event fires.
    // Resets the canvas dimensions to match window,
    // then draws the new borders accordingly.
    function resizeCanvas() {

        browserDetect.update();

        screen.resize();

        snake.setScreenDim(screen.getScreenGridDim());
        restartGame();
    }


    function moveGoalBlock() {

       if(!goalBlock) {
           goalBlock = Block();
       }

       // Find a new space for the goal block that is not too close to the snake
       setRandomBlockLocation(goalBlock);
       var maxLoops = 5;  // make sure we don't infinite loop
       while(--maxLoops > 0 && snake.isTooClose(goalBlock)) {
           setRandomBlockLocation(goalBlock);
       }
    }

    function setRandomBlockLocation(block) {

        var loc = screen.getRandomCell();
        block.x = loc.x;
        block.y = loc.y;
    }

    function gameLoop() {

        // if we are getting ready to start a new game, then just draw once.
        switch(state) {
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
                return;

        }

        setTimeout(function() {
            requestAnimationFrame(gameLoop);
            snake.advance();
            if(snake.collisionDetected()) {
                state = 'gameOver';
            } else if(snake.ateBlock(goalBlock)) {
                currentScore++;
                updateScoreDisplay();
                snake.addBlock();
                // speed up the game
                fps++;
                moveGoalBlock();
            } else {
                drawGameBoard(true);
            }

        }, 1000 / fps);
    }

    function updateScoreDisplay(){
        // TODO move to screen.js?
        $('#currentScore').text(currentScore);
        $('#highScore').text(highScore);
    }

    function drawGameBoard(drawGoalBlock) {

        screen.redraw();

        if(drawGoalBlock) {
            goalBlock.draw(screen.getCanvasContext(), screen.getScreenGridDim().cellSize);
        }
        snake.draw(screen.getCanvasContext());
    }


    function drawStartGameMessage() {

        var msg;
        if(browserDetect.isMobile() || browserDetect.isTablet()) {
            msg = 'To begin, tap on the Right, Left, or Top';
            screen.centerTextOnCanvas(msg, fontSizes.medium);
        } else {
            msg = 'To begin, press the Right, Left, or Up arrow';
            screen.centerTextOnCanvas(msg, fontSizes.large);
        }

        if(!browserDetect.isMobile() && !browserDetect.isTablet()) {
           screen.centerTextOnCanvas("Press the Space Bar to pause.",  fontSizes.large, 60);
        }
    }


    function drawGameOverMessage() {

        var msg = "GAME OVER!";
        if(currentScore > highScore) {
            msg = "NEW HIGH SCORE!";
        }

       screen.centerTextOnCanvas(msg, fontSizes.large);

       if(browserDetect.isMobile() || browserDetect.isTablet()) {
           msg = 'Tap anywhere to restart';
       }  else {
           msg = "Press the space bar or click on the game to restart";
       }
       screen.centerTextOnCanvas(msg, fontSizes.medium, 40);
    }

    function startGame() {
        if(state === 'gameReady') {
            state = 'gameRunning';
            gameLoop();
        }
    }

    function restartGame() {
      state = 'gameLoading';
      currentScore = 0;
      fps = DEFAULT_FPS;
      moveGoalBlock();
      snake.reset();
      gameLoop();
    }

    // clicking on the game board restarts the game
    $( '#' + canvasID).click(function() {
        restartGame();
    });

    // Handle the arrow key and space bar input to control the snake
    $(document).on('keydown', function(event) {
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
    document.body.addEventListener('touchmove',function(event){
        event.preventDefault();
    },false);	// end body:touchmove


    // Respond to touch events on the mobile devices
    // Divide the screen into right/left/up/down "buttons"
    document.addEventListener('touchstart', function(e) {
        e.preventDefault();

        // restart the game if you touch anywhere on the screen
        // after the game is finished.
        if(state === 'gameOver') {
            restartGame();
            return;
        }

        var touch = e.touches[0];

        var screenDim = screen.getScreenDimPixels();

        // convert touch coordinates to a direction

        // left button is the left-most middle third
        var leftPerimeter = {
            minY: screenDim.height/3,
            maxY: 2*screenDim.height/3,
            minX: 0,
            maxX: screenDim.width/2
        }

        // right button is the right-most middle third
        var rightPerimeter = {
            minY: screenDim.height/3,
            maxY: 2*screenDim.height/3,
            minX: screenDim.width/2,
            maxX: screenDim.width
        }

        // up and down are non-right or left presses above/below
        //  the middle of the screen.
        var point = {x:touch.pageX, y:touch.pageY};
        if(contains(rightPerimeter, point)) {
            handleDirectionChange('right');
        } else if(contains(leftPerimeter, point)) {
            handleDirectionChange('left');
        } else if(point.y <= screenDim.height/2) {
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
        if(state === 'gameOver') {
            restartGame();
        } else {
            if(state === 'gamePaused') {
                state = 'gameRunning';
                gameLoop();
            } else if(state === 'gameRunning') {
                state = 'gamePaused';
            }
        }
    }

    function handleDirectionChange(direction) {

        if(state === 'gameReady') {
            if(direction !== 'down') {
              state = 'gameRunning';
              snake.setDirection(direction);
              gameLoop();
            }
        } else if (state === 'gameRunning') {
            snake.setDirection(direction);
        }
    }


    return {
        init:init
    };

};

