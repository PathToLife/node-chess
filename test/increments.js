var chai = require("chai");
var classic = require("../src/engine/instances/classic");
var classicEngine = classic();
console.log(classicEngine.toString());
var expect = chai.expect;
describe("available move tests", function () {
    pieceMoveTest("will find all available moves for the b2 pawn from the starting position", coord(2, 2), [coord(2, 3)]);
    pieceMoveTest("will find all available moves for b1 knight from the starting position", coord(2, 1), [coord(3, 3), coord(1, 3)]);
    pieceMoveTest("will find all available moves for c1 bishop from the starting position", coord(3, 1), []);
    pieceMoveTest("will find all available moves for d1 queen from the starting position", coord(4, 1), []);
    pieceMoveTest("will find all available moves for e1 king from the starting position", coord(5, 1), []);
    pieceMoveTest("will find all available moves for b7 pawn from the starting position", coord(2, 7), [coord(2, 6)]);
    pieceMoveTest("will find all available moves for b8 knight from the starting position", coord(2, 8), [coord(1, 6), coord(3, 6)]);
    pieceMoveTest("will find all available moves for a7 pawn form the start position", coord(1, 7), [coord(1, 6)]);
});
function pieceMoveTest(message, start, expectedMoves) {
    it(message, function () {
        var moves = classicEngine.availableMoves(start);
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
//# sourceMappingURL=increments.js.map