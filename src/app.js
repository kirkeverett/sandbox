
// Main entry point of the game.
(function() {
    'use strict';

if (!('jQuery' in window)) {
    window.jQuery = window.$ = require('jquery');
}

if (!('_' in window)) {
  window._ = require('underscore');
}

var SnakeGame = require('./snakegame');

var game = SnakeGame();

game.init();

} ());
