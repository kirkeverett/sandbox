// The snake is essentially a collection of Blocks. It can be advanced
//  around the screen one block at a time.
var CanvasContext = function (htmlCanvas) {

    'use strict';

    var _ctx = htmlCanvas && htmlCanvas.getContext("2d");

    // assign properties
    function assign(k, v) {
        if (_ctx) {
            _ctx[k] = v;
        }
    }

    function drawImage(img, sx, sy, swidth, sheight, x, y, width, height) {
        return callMethod('drawImage', arguments);
    }

    function save() {
        return callMethod('save', arguments);
    }

    function restore() {
        return callMethod('restore', arguments);
    }

    function fillText(txt, x, y) {
        return callMethod('fillText', arguments);
    }

    function fillRect(x, y, height, width) {
        return callMethod('fillRect', arguments);
    }

    function rect(x, y, height, width) {
        return callMethod('rect', arguments);
    }

    function beginPath() {
        return callMethod('beginPath', arguments);
    }

    function stroke() {
        return callMethod('stroke', arguments);
    }

    function clearRect(x, y, height, width) {
        return callMethod('clearRect', arguments);
    }

    function callMethod(funcName, args) {
        if (_ctx) {
            return _ctx[funcName].apply(_ctx, args);
        }
    }

    return {
        assign: assign,
        drawImage: drawImage,
        save: save,
        restore: restore,
        fillText: fillText,
        fillRect: fillRect,
        rect: rect,
        beginPath: beginPath,
        stroke: stroke,
        clearRect: clearRect
    };
};


module.exports = CanvasContext;









