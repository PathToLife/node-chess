import Chess = require("node-chess");
import nodeChess = require("../src/index");
import chai = require("chai");
var expect = chai.expect;

var classic: Chess.Engine = nodeChess.classic.engine();
classic.populateAvailableMoves();

var classicMoveTest = pieceMoveTest.bind(classic);
var classicMovesTest = hasMovesTest.bind(classic);
var classicTagTest = hasTagTest.bind(classic);
var classicLocationTest = atLocationTest.bind(classic);

var checkmate: Chess.Engine = nodeChess.classic.engine();
checkmate.positionParser("6bk/6pp/3N4/8/8/8/PP2PPPP/RNBQKB1R w KQkq - 0 1");
checkmate.populateAvailableMoves();
var cmMoveTest = pieceMoveTest.bind(checkmate);


describe("available move tests", () => {
	
	classicMovesTest("will find all available moves for the b2 pawn from the starting position", coord(2, 2), [coord(2, 3), coord(2, 4)]);
	classicMovesTest("will find all available moves for b1 knight from the starting position", coord(2, 1), [coord(3, 3), coord(1, 3)]);
	classicMovesTest("will find all available moves for c1 bishop from the starting position", coord(3, 1), []);
	classicMovesTest("will find all available moves for d1 queen from the starting position", coord(4, 1), []);
	classicMovesTest("will find all available moves for e1 king from the starting position", coord(5, 1), []);
	classicMovesTest("will find all available moves for b7 pawn from the starting position", coord(2, 7), [coord(2, 6), coord(2, 5)]);
	classicMovesTest("will find no available moves for b8 knight from the starting position", coord(2, 8), [coord(1, 6), coord(3, 6)]);
	classicMovesTest("will find all available moves for a7 pawn form the start position", coord(1, 7), [coord(1, 6), coord(1, 5)]);
});

describe("movement tests", () => {
	
	classicMoveTest("[White] will move a2-a3", coord(1, 2), coord(1, 3));
	classicMoveTest("[White] will not move a3-a4 due to being black's turn", coord(1, 3), coord(1, 4), true);
	classicMoveTest("[Black] will move a7-a6", coord(1, 7), coord(1, 6));
	classicMoveTest("[White] will move a3-a4", coord(1, 3), coord(1, 4));
	classicMoveTest("[Black] will move a6-a5", coord(1, 6), coord(1, 5));
	classicMoveTest("[White] will move not move a4-a5 due to 'cannot capture'", coord(1, 5), coord(1, 6), true);
	classicMoveTest("[White] will move g1-h3", coord(7, 1), coord(8, 3));
	classicMoveTest("[Black] will move b7-b5", coord(2, 7), coord(2, 5));
	classicMoveTest("[White] will capture from a4-b5", coord(1, 4), coord(2, 5));
	classicMoveTest("[Black] will move c7-c5, enabling enpassant capture on c6", coord(3, 7), coord(3, 5));
	classicMovesTest("will find all available moves for white pawn on b5", coord(2, 5), [coord(2, 6), coord(3, 6)]);
	classicMoveTest("[White] will capture EnPassant from b5-c6", coord(2, 5), coord(3, 6));
	classicTagTest("enpassant tag on c6 will be removed after the capture", coord(3, 6), "enpassant", undefined);
	classicMoveTest("[Black] will move Nb8-Na6", coord(2, 8), coord(1, 6));
	classicMoveTest("[White] will move g2 pawn two squares to for enpassant tag", coord(7, 2), coord(7, 4));
	classicTagTest("will have enpassant tag on g3", coord(7, 3), "enpassant", true);
	classicMoveTest("[Black] will move Bc8-Bb7", coord(3, 8), coord(2, 7));
	classicMoveTest("[White] will move Bf1-Bg2 to enable white king-side castling", coord(6, 1), coord(7, 2));
	classicMoveTest("[Black] will move Qd8-Qc7 enabling queenside castling", coord(4, 8), coord(3, 7));
	classicMovesTest("[White] will be able to move Ke1-Kg1 (O-O) and Ke1-Kf1", coord(5, 1), [coord(6, 1), coord(7, 1)]);
	classicMoveTest("[White] will castle king side (Ke1-Kg1 or O-O)", coord(5, 1), coord(7, 1));
	classicLocationTest("will have white rook on f1 after castling", coord(6, 1), "R");
	classicMovesTest("[Black] will be able to move Ke8-Kc8 (o-o-o) and Ke8-Kd8", coord(5, 8), [coord(3, 8), coord(4, 8)]);
	classicMoveTest("[Black] will castle queen side (Ke8-Kc8 or o-o-o)", coord(5, 8), coord(3, 8));	
	classicLocationTest("will have black rook on d8 after castling", coord(4, 8), "r");
});

describe("game conclusion tests", () => {
	cmMoveTest("[CheckMate] will move Nf7#", coord(4,6), coord(6,7));
});

function hasTagTest(message: string, coordinate: Chess.Coordinate, tagName: string, expected: any) {
	it(message, () => {
		var board: Chess.Engine = this;
		var square = board.getSquare(coordinate);
		expect(square.tags[tagName]).to.equal(expected);
	});
}

function atLocationTest(message: string, location: Chess.Coordinate, notation: string) {
	it(message, () => {
		var board: Chess.Engine = this;
		var square = board.getSquare(location);
		expect(square.piece.notation).to.equal(notation);
	});
}

function hasMovesTest(message: string, start: Chess.Coordinate, expectedMoves: Chess.Coordinate[]): void {
	it(message, () => {
		var board: Chess.Engine = this;
		var moves = board.boardState.moves
			.filter(move => move.from.file === start.file && move.from.rank === start.rank)
			.map(move => move.to);

		expectedMoves.forEach(m => expect(moves).to.include({ rank: m.rank, file: m.file }));
		expect(expectedMoves.length).to.equal(moves.length);
	});
}

function coord(file: number, rank: number) {
	return { file: file, rank: rank };
}

function compare(left: Chess.Coordinate, right: Chess.Coordinate): boolean {
	return left.rank === right.rank && left.file === right.file;
}

function move(direction: Chess.Direction, count: number): Chess.SingleMove {
	return { direction: direction, count: count };
}

/**
 * Test that a piece successfully moved
 */
var count = 0;
function pieceMoveTest(message: string, from: Chess.Coordinate, to: Chess.Coordinate, wont = false) {
	var board: Chess.Engine = this;
	
	it(message, () => {
		var expected = wont ? from : to;
		var square: Chess.Square = board.getSquare(from);
		var piece: Chess.Piece = board.getSquare(from).piece;
		var newState = board.movePiece(from, to);
		var moved: Chess.Square = board.getSquare(expected, newState);
		var movedPiece = moved.piece;	
		
		if (wont) {
			expect(newState).to.be.null;
			return;
		}
		// A bit elaborate due to immutability of movePiece function
		expect(movedPiece).to.exist;
		expect(movedPiece.location.file).to.equal(expected.file);
		expect(movedPiece.location.rank).to.equal(expected.rank);
		expect(movedPiece.isWhite).to.equal(piece.isWhite);
		expect(movedPiece.notation).to.equal(piece.notation);
	});
}