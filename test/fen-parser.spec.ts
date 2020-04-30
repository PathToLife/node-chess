import classicEngine from '../src/engine/instances/classic/engine';
import {expect} from 'chai';

describe("fen parsing tests", () => {

    it("will have a pawn at 7,2", () => {
        const rankEight = classicEngine().boardState.ranks[7];
        const fileOne = rankEight.squares[2];
        expect(fileOne.piece).to.exist;
    });

    it("will generate default classic chess fen string", () => {
        const s = classicEngine().stringifyFenString()
        expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    })

    it("will generate correct fen string, pawn move", () => {
        const e = classicEngine();
        e.movePiece({from: {file: 1, rank: 2}, to: {file: 1, rank: 3}})
		const s = e.stringifyFenString()
        expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 2')
    })
});
