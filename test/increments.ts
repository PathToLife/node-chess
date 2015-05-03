import Engine = require("../src/engine/engine");
import chai = require("chai");
import Direction = require("../src/direction");
import pieces = require("../src/engine/pieces/pieces");
import classic = require("../src/engine/instances/classic");

var classicEngine = classic();
classicEngine.populateAvailableMoves();

var expect = chai.expect;

describe("available move tests", () => {
	pieceAvailableMovesTest("will find all available moves for the b2 pawn from the starting position", coord(2,2), [coord(2,3)]);
	pieceAvailableMovesTest("will find all available moves for b1 knight from the starting position", coord(2,1), [coord(3,3), coord(1,3)]);
	pieceAvailableMovesTest("will find all available moves for c1 bishop from the starting position", coord(3,1), []);
	pieceAvailableMovesTest("will find all available moves for d1 queen from the starting position", coord(4,1), []);
	pieceAvailableMovesTest("will find all available moves for e1 king from the starting position", coord(5,1), []);
	pieceAvailableMovesTest("will find all available moves for b7 pawn from the starting position", coord(2,7), [coord(2,6)]);
	pieceAvailableMovesTest("will find all available moves for b8 knight from the starting position", coord(2,8), [coord(1,6), coord(3,6)]);
	pieceAvailableMovesTest("will find all available moves for a7 pawn form the start position", coord(1,7), [coord(1,6)]);
});

describe("movement tests", () => {
	pieceMoveTest("will move a2 pawn to a3", { from: { file: 1, rank: 2 }, to: { file: 1, rank: 3 } }, true);
	pieceAvailableMovesTest("will find all available moves for the a3 pawn", coord(1,3), [coord(1,4)]);
});

function pieceAvailableMovesTest(message: string, start: Chess.Coordinate, expectedMoves: Chess.Coordinate[]): void {
	it(message, () => {
		var moves = classicEngine.getSquare(start).availableMoves;
		expectedMoves.forEach(m => expect(moves).to.include({rank: m.rank, file: m.file }));
		expect(expectedMoves.length).to.equal(moves.length);
	});
}

function coord(file: number, rank: number) {
	return { file: file, rank: rank };
}

function compare(left: Chess.Coordinate, right: Chess.Coordinate): boolean {
	return left.rank === right.rank && left.file === right.file;
}

function move(direction: Direction, count: number): Chess.SingleMove {
	return { direction: direction, count: count };
}

function pieceMoveTest(message: string, move: Chess.Move, expected: boolean) {
	it (message, () => {
		var moveResult = classicEngine.movePiece(move);
		expect(expected).to.equal(moveResult);
	});
}