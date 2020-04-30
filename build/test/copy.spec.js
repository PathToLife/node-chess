"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const chai_1 = require("chai");
const deepCopy_1 = require("../src/engine/helpers/deepCopy");
const newBoard = src_1.default.classic.engine;
describe("deep copy tests", () => {
    it("will return a copy of the board state", () => {
        var states = copyState();
        chai_1.expect(states.left !== states.right).to.be.true;
    });
    it("will delete the moves array and not affect the other copy (no shared reference)", () => {
        var states = copyState();
        states.left.moves = [];
        chai_1.expect(states.left.moves.length < states.right.moves.length).to.be.true;
    });
    it("will move a piece and not mutate the board's boardState", () => {
        var board = newBoard();
        var copy = deepCopy_1.default(board.boardState);
        var original = board.boardState;
        var future = board.calculateMovePiece({ from: c(1, 2), to: c(1, 3) }, board.boardState);
        chai_1.expect(future).to.exist;
        var originalSquare = board.boardState.ranks[2].squares[1];
        var futureSquare = future ? future.newBoardState.ranks[2].squares[1] : null;
        chai_1.expect(originalSquare.piece).to.exist;
        chai_1.expect(futureSquare === null || futureSquare === void 0 ? void 0 : futureSquare.piece).to.not.exist;
    });
    it("will move a piece and not mutate the original boardState's moves", () => {
        var board = newBoard();
        board.parseFenString("k6n/7p/8/8/8/8/7P/K6N w KQkq - 0 1");
        var o = board.boardState;
        var future = board.calculateMovePiece(m(c(8, 2), c(8, 3)), o);
        chai_1.expect(o.moves.length).to.equal(future ? future.newBoardState.moves.length + 1 : null);
        var realFuture = board.movePiece(m(c(8, 2), c(8, 3)));
        chai_1.expect(board.boardState.moves.length).to.equal(realFuture === null || realFuture === void 0 ? void 0 : realFuture.moves.length);
    });
});
function m(from, to) {
    return { from, to };
}
function c(file, rank) {
    return { file, rank };
}
function copyState() {
    var state = newBoard().boardState;
    return {
        left: state,
        right: deepCopy_1.default(state)
    };
}
//# sourceMappingURL=copy.spec.js.map