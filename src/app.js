
// TODO: Animation is choppy in Firefox
// TODO: inheritence and _extends(...)
// TODO: run jshint
// TODO: Add a dificulty level (high = auto-pilot snake)

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
