var chai = require("chai");
var classic = require("../src/engine/instances/classic");
var classicEngine = classic();
classicEngine.populateAvailableMoves();
var expect = chai.expect;
describe("available move tests", function () {
    pieceAvailableMovesTest("will find all available moves for the b2 pawn from the starting position", coord(2, 2), [coord(2, 3)]);
    pieceAvailableMovesTest("will find all available moves for b1 knight from the starting position", coord(2, 1), [coord(3, 3), coord(1, 3)]);
    pieceAvailableMovesTest("will find all available moves for c1 bishop from the starting position", coord(3, 1), []);
    pieceAvailableMovesTest("will find all available moves for d1 queen from the starting position", coord(4, 1), []);
    pieceAvailableMovesTest("will find all available moves for e1 king from the starting position", coord(5, 1), []);
    pieceAvailableMovesTest("will find all available moves for b7 pawn from the starting position", coord(2, 7), [coord(2, 6)]);
    pieceAvailableMovesTest("will find all available moves for b8 knight from the starting position", coord(2, 8), [coord(1, 6), coord(3, 6)]);
    pieceAvailableMovesTest("will find all available moves for a7 pawn form the start position", coord(1, 7), [coord(1, 6)]);
});
describe("movement tests", function () {
    pieceMoveTest("will move a2 pawn to a3", coord(1, 2), coord(1, 3), true);
    pieceAvailableMovesTest("will find all available moves for the a3 pawn", coord(1, 3), [coord(1, 4)]);
    pieceMoveTest("will not move a3 pawn to a5", coord(1, 3), coord(1, 5), false);
    pieceMoveTest("will move a3 pawn to a4", coord(1, 3), coord(1, 4), true);
    pieceMoveTest("will move a4 pawn to a5", coord(1, 4), coord(1, 5), true);
    pieceMoveTest("will move a5 pawn to a6", coord(1, 5), coord(1, 6), true);
    pieceMoveTest("will not move a6 pawn to a7", coord(1, 3), coord(1, 5), false);
    pieceMoveTest("will capture from a6 to b7", coord(1, 6), coord(2, 7), true);
});
function pieceAvailableMovesTest(message, start, expectedMoves) {
    it(message, function () {
        var moves = classicEngine.getSquare(start).availableMoves;
        expectedMoves.forEach(function (m) { return expect(moves).to.include({ rank: m.rank, file: m.file }); });
        expect(expectedMoves.length).to.equal(moves.length);
    });
}
function coord(file, rank) {
    return { file: file, rank: rank };
}
function compare(left, right) {
    return left.rank === right.rank && left.file === right.file;
}
function move(direction, count) {
    return { direction: direction, count: count };
}
function pieceMoveTest(message, from, to, expected) {
    var move = { from: from, to: to };
    it(message, function () {
        var moveResult = classicEngine.movePiece(move);
        expect(expected).to.equal(moveResult);
    });
}
//# sourceMappingURL=increments.js.map