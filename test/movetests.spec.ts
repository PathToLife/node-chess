import {expect} from 'chai';
import engine from "../src/engine/instances/classic/engine";

describe('should move pawns correctly',  () => {
    const e = engine()
    expect(e.stringifyFenString()).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    it('should allow white to move first', () => {
        const res = e.movePiece({from: {file: 4, rank: 2}, to: {file: 4, rank: 4}})
        expect(res).to.be.not.null;
    })

    it ('should not allow white to repeat move', () => {
        const res2 = e.movePiece({from: {file: 4, rank: 2}, to: {file: 4, rank: 4}})
        expect(res2).to.be.null;
    })

    it('should not allow white to move a different piece', () => {
        const res3 = e.movePiece({from: {file: 3, rank: 2}, to: {file: 3, rank:3}})
        expect(res3).to.be.null;
    })

});
