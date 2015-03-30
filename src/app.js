
// Main entry point of the game.
SNAKEGAME = (function() {
    'use strict';

if (!('jQuery' in window)) {
    window.jQuery = window.$ = require('jquery');
}

if (!('_' in window)) {
  window._ = require('underscore');
}

var Screen = require('./screen');

var screen = Screen.getInstance();
screen.initialize($('#gameCanvas').get(0));

var SnakeGame = require('./snakegame');
return SnakeGame();

} ());