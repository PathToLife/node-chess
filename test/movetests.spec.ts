import {expect} from 'chai';
import engine from "../src/engine/instances/classic/engine";
import {pawn, queen, rook} from "../src";
import Engine from "../src/engine";

describe('should move pawns correctly', () => {
    const e = engine()
    expect(e.stringifyFenString()).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    it('should allow white to move first', () => {
        const res = e.movePiece({from: {file: 4, rank: 2}, to: {file: 4, rank: 4}})
        expect(res).to.be.not.null;
    })

    it('should not allow white to repeat move', () => {
        const res2 = e.movePiece({from: {file: 4, rank: 2}, to: {file: 4, rank: 4}})
        expect(res2).to.be.null;
    })

    it('should not allow white to move a different piece', () => {
        const res3 = e.movePiece({from: {file: 3, rank: 2}, to: {file: 3, rank: 3}})
        expect(res3).to.be.null;
    })
});

describe('should detect check', () => {
    const e = engine()
    e.parseFenString('rnb1kbnr/ppp2ppp/8/3pp1q1/3P4/2P5/PP1KPPPP/RNBQ1BNR w KQkq - 0 7')

    it('should have white king in the right place', () => {
        const sq = e.getSquare({file: 4, rank: 2})
        expect(sq.piece?.name).to.equal('King')
        expect(sq.piece?.isWhite).to.be.true;
    })
    it('should have black queen in the right place', () => {
        const sq = e.getSquare({file: 7, rank: 5})
        expect(sq.piece?.name).to.equal('Queen')
        expect(sq.piece?.isWhite).to.be.false;
    })
    it('should be white move', () => {
        expect(e.boardState.whitesTurn).to.be.true
    })
    it('should detect check', () => {
        expect(e.boardState.tags.inCheckSquares.length > 0)
    })
    it('should not allow move that does not solve check', () => {
        // console.log(e.toString())
        const res = e.movePiece({from: {file: 3, rank: 3}, to: {file: 3, rank: 4}})
        expect(res).to.be.null;
    })
})

describe('should detect check resolve', () => {
    const e = engine();
    e.parseFenString('rnbq1bnr/ppp1kppp/4p3/3p4/3P4/Q1P5/PP2PPPP/RNB1KBNR b KQ - 7 8')
    // console.log(e.toString())

    it('should be in check', () => {
        expect(e.boardState.tags.inCheckSquares).length.to.be.greaterThan(0);
    })
    it('should resolve check', () => {
        const res = e.movePiece({from: {file: 4, rank: 8}, to: {file: 4, rank: 6}})
        expect(res).to.not.be.null;
    })
})

describe('should not allow weird enpassant move', () => {
    const e = engine()

    it('should move white pawn', () => {
        expect(e.movePiece({from: {file: 5, rank: 2}, to: {file: 5, rank: 4}})).to.not.be.null;
        // console.log(e.toString());
    })

    it('should move black pawn', () => {
        expect(e.movePiece({from: {file: 5, rank: 7}, to: {file: 5, rank: 5}})).to.not.be.null;
        // console.log(e.toString());
    })

    it('should not enpassant move weird white pawn', () => {
        expect(e.movePiece({from: {file: 6, rank: 2}, to: {file: 5, rank: 3}})).to.be.null;
        // console.log(e.toString());
    })
})

describe('pawn should not capture piece on move', () => {
    const e = addPlaceHolderSpecialDefinitions(engine())
    e.parseFenString('dwaqkawd/ppp1pppp/3p4/7Q/4P3/8/PPPP1PPP/DWA1KAWD b KQkq - 3 4');

    it('should deny move', () => {
        const res = e.movePiece({from: {file: 8, rank: 7}, to: {file: 8, rank: 5}});
        expect(res).to.be.null;
    })
})

describe('should promote to correct color', () => {
    // const e = engine();
    // e.parseFenString('rnb1kbnr/ppp2ppp/8/3p4/2BP3q/2P2PPN/PP1K3P/RNBQq2R w KQkq - 20 21')

    const e2 = addPlaceHolderSpecialDefinitions(engine())
    e2.parseFenString('2kdqa1d/pppa2P1/4p3/2wp3W/3P3p/3DP3/PPP2P1P/DWAQKA2 w KQ - 34 35');

    it('should have pawn on 7,7', () => {
        const sq = e2.getSquare({file: 7, rank: 7})
        expect(sq.piece?.name).to.equal(pawn.name);
        expect(sq.piece?.isWhite).to.be.true;
    })

    it('should allow move of pawn to 7,8', () => {
        expect(e2.movePiece({from: {file: 7, rank: 7}, to: {file: 7, rank: 8}})).not.be.null;
    })

    it('should promote pawn to queen', () => {
        const sq = e2.getSquare({file: 7, rank: 8})
        expect(sq.piece?.name).to.equal(queen.name);
        expect(sq.piece?.isWhite).to.be.true;
    })

})

describe('should not allow pawn to jump over pieces on start', () => {

    const e2 = addPlaceHolderSpecialDefinitions(engine())

    it ('should not allow pawn jump 2 move or opponent piece', () => {
        e2.parseFenString('dwaqka1d/pppppppp/8/8/4P3/3P2w1/PPP2PPP/DWAQKAWD w KQkq - 4 5')
        expect(e2.movePiece({from: {file: 7, rank: 2}, to: {file: 7, rank: 4}})).be.null;
        console.log(e2.toString())
    })

    it ('should not allow pawn jump 2 move over same piece', () => {
        e2.parseFenString('dwaqkawd/ppp1pppp/3p4/8/8/3A4/PPPPPPPP/DW1QKAWD w KQkq - 2 3')
        expect(e2.movePiece({from: {file: 4, rank: 2}, to: {file: 4, rank: 4}})).be.null;
        console.log(e2.toString())
    })

})

function addPlaceHolderSpecialDefinitions(e: Engine) {
    const d2 = {
        ...rook,
        notation: 'd'
    }
    const w2 = {
        ...rook,
        notation: 'w'
    }
    const a2 = {
        ...rook,
        notation: 'a'
    }
    e.pieceDefinitions.push(d2, w2, a2);
    return e;
}
