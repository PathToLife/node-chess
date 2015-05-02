import Engine = require("../src/engine/engine");
import chai = require("chai");
import Direction = require("../src/direction");
import pieces = require("../src/engine/pieces/pieces");
import classic = require("../src/engine/instances/classic");

var classicEngine = classic();
classicEngine.populateAvailableMoves();
console.log(classicEngine.toString());

var expect = chai.expect;

describe("available move tests", () => {
	pieceMoveTest("will find all available moves for the b2 pawn from the starting position", coord(2,2), [coord(2,3)]);
	pieceMoveTest("will find all available moves for b1 knight from the starting position", coord(2,1), [coord(3,3), coord(1,3)]);
	pieceMoveTest("will find all available moves for c1 bishop from the starting position", coord(3,1), []);
	pieceMoveTest("will find all available moves for d1 queen from the starting position", coord(4,1), []);
	pieceMoveTest("will find all available moves for e1 king from the starting position", coord(5,1), []);
	pieceMoveTest("will find all available moves for b7 pawn from the starting position", coord(2,7), [coord(2,6)]);
	pieceMoveTest("will find all available moves for b8 knight from the starting position", coord(2,8), [coord(1,6), coord(3,6)]);
	pieceMoveTest("will find all available moves for a7 pawn form the start position", coord(1,7), [coord(1,6)]);
});

function pieceMoveTest(message: string, start: Chess.Coordinate, expectedMoves: Chess.Coordinate[]): void {
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
