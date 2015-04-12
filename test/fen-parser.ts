import Chess = require("../src/types");
import Engine = require("../src/engine/engine");
import Fen = require("../src/engine/parsers/fen");
import pieces = require("../src/engine/pieces/pieces");
import chai = require("chai");
var expect = chai.expect;

// Starting position represented as a FEN string
var start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("fen parsing tests", () => {
	// Build a basic board with a pawn a valid piece
	var engine = new Engine();

	// Add all classical pieces to the board
	for (var p in pieces) engine.pieces.push(new pieces[p]());

	// Use FEN parser to properly instantiate the board state
	var fen = new Fen(engine);

	// Fingers crossed!
	fen.parse(start);

	it("will have a pawn at 7,2", () => {
		var rankEight = engine.ranks[7];
		var fileOne = rankEight.squares[2];
		expect(fileOne.piece).to.exist;
	});
});
