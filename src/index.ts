import classicBoard = require("./boards/classic");

var board = classicBoard();
var moves = console.log(board.availableMoves({file: 3, rank: 1}));
