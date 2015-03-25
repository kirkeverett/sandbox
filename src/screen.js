/*
   The Screen singleton represents abstracts the html canvas and game dimensions.
    --  Serves as "base" object to the other game objects.
    --  Divides up the html canvas into a grid of square blocks.
    -- Dynamically resizes the canvas and grid based on browser resize events
*/
var BrowserDetect = require('./browserdetect');

var Screen = (function () {
    'use strict';

    var instance;

    function createInstance() {

        'use strict';

        // TODO: These ids and paths should be externalized
        var gameArea = $('#gameArea');
        var statsArea = $('#statsArea');
        var htmlCanvas = $('#gameCanvas').get(0);
        var spriteImgPath = './css/sprite.png';
        var fontFamily = "Sans-Serif";
        var textColor = '#473070';

        // grid dimensions in cells
        var numCols = 0;
        var numRows = 0;
        var cellSize = 0;

        // overall canvas size in pixels
        var screenHeight = 0;
        var screenWidth = 0;

        // canvas context
        var ctx;
        var spriteImg;

        // Map of the icon locations in the sprite image.
        var spriteLocMap = {
            'apple': {
                pixelsLeft: 0,
                pixelsTop: 0,
                width: 128,
                height: 128
            },
            'rightarrow': {
                pixelsLeft: 128,
                pixelsTop: 0,
                width: 128,
                height: 128
            }
        }


        function init() {

            ctx = htmlCanvas.getContext("2d");

            // re-calc the grid dimensions if the window changes size.
            window.addEventListener('resize', resize, false);
            window.addEventListener('orientationchange', resize, false);

            // Load the sprite image
            spriteImg = new Image();
            spriteImg.src = spriteImgPath;

            resize();

        }

        function getScreenDimPixels() {
            return {
                width: screenWidth,
                height: screenHeight
            }
        }

        function getScreenGridDim() {
            return {
                numCols: numCols,
                numRows: numRows,
                cellSize: cellSize
            }
        }

        function getRandomCell(excludePerimeter) {

            // if excludePerimeter, then don't pick a cell on the border of the game
            var offset = excludePerimeter ? 1 : 0;

            return {
                x: _.random(offset, (numCols - 1 - offset)),
                y: _.random(offset, (numRows - 1 - offset))
            }
        }

        // Resize the grid based on the new window dimensions
        function resize() {

            screenWidth = gameArea.innerWidth();
            screenHeight = gameArea.innerHeight() - statsArea.innerHeight();

            // we want the cell size to be a pct of the longest screen dimension
            var cellSizePct = .02 * window.devicePixelRatio;
            var longestDim = Math.max(screenWidth, screenHeight);

            cellSize = Math.max(0, Math.trunc(longestDim * cellSizePct));
            numCols = Math.trunc(screenWidth / cellSize);
            numRows = Math.trunc(screenHeight / cellSize);

            // adjust the canvas to be a integer number of cells wide and deep.
            htmlCanvas.width = cellSize * numCols;
            htmlCanvas.height = cellSize * numRows;
        }

        // Draw a sprite image with the "name". Scale the img proportionally to fit the width
        function drawSprite(spriteName, x, y, width) {

            var spriteLoc = spriteLocMap[spriteName];

            var scale = width / spriteLoc.width;

            ctx.drawImage(spriteImg,
                spriteLoc.pixelsLeft,
                spriteLoc.pixelsTop,
                spriteLoc.width,
                spriteLoc.height,
                x,
                y,
                spriteLoc.width * scale,
                spriteLoc.height * scale);
        }


        function centerTextOnCanvas(text, fontSize, yOffset) {

            yOffset = yOffset || 0;

            // draw text centered horizontally about 1/4 of the screen height down.
            drawCenteredText(text, fontSize, htmlCanvas.width / 2, (yOffset + htmlCanvas.height / 4));
        }

        function drawCenteredText(txt, fontSize, x, y) {

            /// lets save current state as we make a lot of changes
            ctx.save();

            /// set font. Scale it if we need to for the device/browser
            ctx.font = (fontSize * BrowserDetect.getInstance().getFontScale()) + "px " + fontFamily;

            // x,y coords are the vert and horz centered midpoint of the text
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";

            /// text color
            ctx.fillStyle = textColor;

            /// draw text on top
            ctx.fillText(txt, x, y);

            /// restore original state
            ctx.restore();
        }

        // Draw a basic square block
        var drawCell = function (x, y, fillColor, borderColor) {

            ctx.fillStyle = fillColor || '#FF0000';  // Red
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            ctx.beginPath(); //
            ctx.fillStyle = borderColor || '#000000';
            ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.stroke();
        }


        // Clear the canvas area
        var clearCanvas = function () {
            // clear the game area
            ctx.clearRect(0, 0, screenWidth, screenHeight);

            // draw a border around the game area
            ctx.beginPath(); //
            ctx.fillStyle = "#000000";
            ctx.rect(0, 0, screenWidth, screenHeight);
            ctx.stroke();
        }


        // pressing the "full screen" button toggles full screen mode
        $('#fullScreenToggle').click(function () {
            if (toggleFullScreen()) {
                $('#fullScreenToggle').text('Exit Full-Screen');
            } else {
                $('#fullScreenToggle').text('Full-Screen');
            }
        });


        // toggle the browser to/from full screen if the browser supports it
        function toggleFullScreen() {
            // Support is sketchy right now so...
            if (!document.fullscreenElement && !document.mozFullScreenElement &&
                !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
                return true;
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                return false;
            }
        }


        // initialize the object
        init();

        return {
            resize: resize,
            getScreenDimPixels: getScreenDimPixels,
            getScreenGridDim: getScreenGridDim,
            getRandomCell: getRandomCell,
            centerTextOnCanvas: centerTextOnCanvas,
            drawCenteredText: drawCenteredText,
            drawCell: drawCell,
            clearCanvas: clearCanvas,
            toggleFullScreen: toggleFullScreen,
            drawSprite: drawSprite
        };

    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = Screen;