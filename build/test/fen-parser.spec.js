"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("../src/engine/instances/classic/engine");
const chai_1 = require("chai");
describe("fen parsing tests", () => {
    it("will have a pawn at 7,2", () => {
        const rankEight = engine_1.default().boardState.ranks[7];
        const fileOne = rankEight.squares[2];
        chai_1.expect(fileOne.piece).to.exist;
    });
    it("will generate default classic chess fen string", () => {
        const s = engine_1.default().stringifyFenString();
        chai_1.expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });
    it("will generate correct fen string, pawn move", () => {
        const e = engine_1.default();
        e.movePiece({ from: { file: 1, rank: 2 }, to: { file: 1, rank: 3 } });
        const s = e.stringifyFenString();
        chai_1.expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 2');
    });
    it("will nobe affected by info calls, multiple calls stable", () => {
        const e = engine_1.default();
        for (let i = 0; i < 100; i++) {
            const s = e.stringifyFenString();
            chai_1.expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            e.getMoves({ rank: i, file: i });
        }
    });
});
//# sourceMappingURL=fen-parser.spec.js.map