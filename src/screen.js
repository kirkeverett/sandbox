module.exports = function(browserDetector, gameAreaHtmlID, statsAreaHtmlID, canvasHtmlID) {

    'use strict';

    var browserDetect = browserDetector;
    var fontFamily = "Sans-Serif";
    var textColor = '#473070';

    var canvasID = canvasHtmlID;
    var htmlCanvas;
    var ctx;
    var gameAreaID = gameAreaHtmlID;
    var gameArea;
    var statsAreaID = statsAreaHtmlID;
    var statsArea;

    var blockSize;
    var numCols = 0;
    var numRows = 0;
    var cellSize = 0;
    var screenHeight = 0;
    var screenWidth = 0;

    function init() {
        gameArea = $('#' + gameAreaID);
        statsArea = $('#' + statsAreaID);
        htmlCanvas = $('#' + canvasID).get(0);
        ctx = htmlCanvas.getContext("2d");

        resize();
    }


    function getScreenDimPixels() {
        return {
           width :  screenWidth,
           height : screenHeight
        }
    }

    function getScreenGridDim() {
        return {
            numCols : numCols,
            numRows : numRows,
            cellSize : cellSize
        }
    }

    function getRandomCell() {
        return {
            x : getRandomInt(0, htmlCanvas.width / cellSize),
            y : getRandomInt(0, htmlCanvas.height / cellSize)
         }
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    function resize() {

        screenWidth =  gameArea.innerWidth();
        screenHeight = gameArea.innerHeight() - statsArea.innerHeight();

        // we want the cell size to be a pct of the longest screen dimension
        var cellSizePct = .02 * window.devicePixelRatio;
        var longestDim = Math.max(screenWidth, screenHeight);

        cellSize = Math.max(0, Math.trunc(longestDim * cellSizePct));
        numCols = Math.trunc(screenWidth/cellSize);
        numRows = Math.trunc(screenHeight/cellSize);

        htmlCanvas.width = cellSize*numCols;
        htmlCanvas.height = cellSize*numRows;
    }

    function redraw() {
        // clear the game area
        ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);

        // draw a border around the game area
        ctx.beginPath(); //
        ctx.fillStyle = "#000000";
        ctx.rect(0, 0, htmlCanvas.width, htmlCanvas.height);
        ctx.stroke();
    }

    function centerTextOnCanvas(text,fontSize, yOffset){

        yOffset = yOffset || 0;

        drawCenteredText(text, fontSize, htmlCanvas.width/2, (yOffset + htmlCanvas.height/4));

        console.log("A fontSize of "+fontSize+"px fits this text on the canvas");
    }


    function drawCenteredText(txt, fontSize, x, y) {

        /// lets save current state as we make a lot of changes
        ctx.save();

        /// set font
        ctx.font = (fontSize*browserDetect.getFontScale()) + "px " + fontFamily;

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


    function getCanvasContext() {
        return ctx;
    }

    init();

    return {
        redraw:redraw,
        resize:resize,
        getScreenDimPixels:getScreenDimPixels,
        getScreenGridDim:getScreenGridDim,
        getRandomCell:getRandomCell,
        centerTextOnCanvas:centerTextOnCanvas,
        drawCenteredText:drawCenteredText,
        getCanvasContext:getCanvasContext
    };

};
