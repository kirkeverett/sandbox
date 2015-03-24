// The Screen singleton represents abstracts the html canvas and game dimensions. It also
//  serves as "base" object to the other game objects

var BrowserDetect = require('./browserdetect');
var Screen = (function () {
    'use strict';

    var instance;

    function createInstance() {

        'use strict';

        var gameArea = $('#gameArea');
        var statsArea = $('#statsArea');
        var htmlCanvas = $('#gameCanvas').get(0);
        var fontFamily = "Sans-Serif";
        var textColor = '#473070';

        var numCols = 0;
        var numRows = 0;
        var cellSize = 0;
        var screenHeight = 0;
        var screenWidth = 0;
        var ctx;

        function init() {

            ctx = htmlCanvas.getContext("2d");

            // re-calc the grid dimensions if the window changes size.
            window.addEventListener('resize', resize, false);
            window.addEventListener('orientationchange', resize, false);

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


        function resize() {

            screenWidth = gameArea.innerWidth();
            screenHeight = gameArea.innerHeight() - statsArea.innerHeight();

            // we want the cell size to be a pct of the longest screen dimension
            var cellSizePct = .02 * window.devicePixelRatio;
            var longestDim = Math.max(screenWidth, screenHeight);

            cellSize = Math.max(0, Math.trunc(longestDim * cellSizePct));
            numCols = Math.trunc(screenWidth / cellSize);
            numRows = Math.trunc(screenHeight / cellSize);

            htmlCanvas.width = cellSize * numCols;
            htmlCanvas.height = cellSize * numRows;
        }

        function centerTextOnCanvas(text, fontSize, yOffset) {

            yOffset = yOffset || 0;

            drawCenteredText(text, fontSize, htmlCanvas.width / 2, (yOffset + htmlCanvas.height / 4));
        }

        function drawCenteredText(txt, fontSize, x, y) {

            /// lets save current state as we make a lot of changes
            ctx.save();

            /// set font
            ctx.font = (fontSize * BrowserDetect.getInstance().getFontScale()) + "px " + fontFamily;

            /// draw text from top - makes life easier at the moment
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";

            /// text color
            ctx.fillStyle = textColor;

            /// draw text on top
            ctx.fillText(txt, x, y);

            /// restore original state
            ctx.restore();
        }

        // default draw method
        var drawCell = function (x, y, fillColor, borderColor) {

            ctx.fillStyle = fillColor || '#FF0000';  // Red
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            ctx.beginPath(); //
            ctx.fillStyle = borderColor || '#000000';
            ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.stroke();
        }

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


        function toggleFullScreen() {
            // Support is sketchy right now so...
            if (!document.fullscreenElement &&
                !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
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
            toggleFullScreen:toggleFullScreen
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