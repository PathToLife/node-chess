"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const engine_1 = require("../src/engine/instances/classic/engine");
describe('should move pawns correctly', () => {
    const e = engine_1.default();
    chai_1.expect(e.stringifyFenString()).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    it('should allow white to move first', () => {
        const res = e.movePiece({ from: { file: 4, rank: 2 }, to: { file: 4, rank: 4 } });
        chai_1.expect(res).to.be.not.null;
    });
    it('should not allow white to repeat move', () => {
        const res2 = e.movePiece({ from: { file: 4, rank: 2 }, to: { file: 4, rank: 4 } });
        chai_1.expect(res2).to.be.null;
    });
    it('should not allow white to move a different piece', () => {
        const res3 = e.movePiece({ from: { file: 3, rank: 2 }, to: { file: 3, rank: 3 } });
        chai_1.expect(res3).to.be.null;
    });
});
describe('should detect check', () => {
    const e = engine_1.default();
    e.parseFenString('rnb1kbnr/ppp2ppp/8/3pP1q1/4P3/5P2/PPPK2PP/RNBQ1BNR b KQkq - 0 10');
    console.log(e.toString());
    it('should have white king in the right place', () => {
        var _a, _b;
        const sq = e.getSquare({ file: 4, rank: 2 });
        chai_1.expect((_a = sq.piece) === null || _a === void 0 ? void 0 : _a.name).to.equal('King');
        chai_1.expect((_b = sq.piece) === null || _b === void 0 ? void 0 : _b.isWhite).to.be.true;
    });
    it('should have black queen in the right place', () => {
        var _a, _b;
        const sq = e.getSquare({ file: 7, rank: 5 });
        chai_1.expect((_a = sq.piece) === null || _a === void 0 ? void 0 : _a.name).to.equal('Queen');
        chai_1.expect((_b = sq.piece) === null || _b === void 0 ? void 0 : _b.isWhite).to.be.false;
    });
    it('should detect check', () => {
        chai_1.expect(e.boardState.tags);
    });
});
//# sourceMappingURL=movetests.spec.js.map