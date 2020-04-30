"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const king_1 = require("../instances/classic/king");
const rook_1 = require("../instances/classic/rook");
const fen_1 = require("./stringParsers/fen");
const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
function hasRookMoved(boardState, isWhite, isQueenSide) {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        const sideQueen = piece.location.file === 0;
        return piece.notation === rook_1.default.notation && piece.isWhite === isWhite && sideQueen === isQueenSide;
    });
}
function hasKingMoved(boardState, isWhite) {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        return piece.notation === king_1.default.notation && move.piece.isWhite === isWhite;
    });
}
/**
 * Converts the board state to a fen string
 * TODO enpassant
 */
function stringifyToFenString() {
    const fen = {
        ranks: [],
        turn: 'w',
        castling: [],
        enpassant: '-',
        halfMove: 0,
        fullMove: 0
    };
    this.boardState.ranks.reverse().forEach(rank => {
        let rankRowPieces = [];
        rank.squares.forEach(sq => {
            if (sq.piece == null) {
                rankRowPieces.push('-');
            }
            else {
                rankRowPieces.push(sq.piece.notation);
            }
        });
        rankRowPieces = rankRowPieces.reduce((accumulator, currentValue) => {
            if (currentValue === '-') {
                const previousValueInt = Number(accumulator.slice(-1)[0]);
                if (!isNaN(previousValueInt)) {
                    accumulator[accumulator.length - 1] = (previousValueInt + 1).toString();
                    return accumulator;
                }
                else {
                    return [...accumulator, '1'];
                }
            }
            return [...accumulator, currentValue];
        }, []);
        fen.ranks.push(rankRowPieces.join(''));
    });
    fen.turn = this.boardState.whitesTurn ? 'w' : 'b';
    if (!hasKingMoved(this.boardState, true)) {
        if (!hasRookMoved(this.boardState, true, false)) {
            fen.castling.push('K');
        }
        if (!hasRookMoved(this.boardState, true, true)) {
            fen.castling.push('Q');
        }
    }
    if (!hasKingMoved(this.boardState, false)) {
        if (!hasRookMoved(this.boardState, false, false)) {
            fen.castling.push('k');
        }
        if (!hasRookMoved(this.boardState, false, true)) {
            fen.castling.push('q');
        }
    }
    if (fen.castling.length === 0) {
        fen.castling.push('-');
    }
    fen.fullMove = this.boardState.moveNumber;
    const ranksStr = fen.ranks.join('/');
    const castingStr = fen.castling.join('');
    return `${ranksStr} ${fen.turn} ${castingStr} ${fen.enpassant} ${fen.halfMove} ${fen.fullMove}`;
}
exports.stringifyToFenString = stringifyToFenString;
/**
 * Parses fen string and sets engine state accordingly
 * Does not load castling or enpassant info.. // Since this engine allows for variants
 *
 * @param position - the fen string
 */
function parseFromFenString(position) {
    const engineInput = fen_1.default.parse(position || defaultPosition);
    this.boardState.whitesTurn = engineInput.turn === "w";
    let rankCount = this.rankCount;
    engineInput.ranks.forEach(rank => {
        this.boardState.ranks[rankCount] = createFilesForRank(this, rank, rankCount);
        rankCount--;
    });
    this.populateAvailableMoves();
}
exports.parseFromFenString = parseFromFenString;
function createFilesForRank(engine, fenRank, rankNumber) {
    const rank = {
        rank: rankNumber,
        squares: []
    };
    const fenRankArray = fenRank.split('');
    let lastNotationNumber = 0;
    let index = 0;
    for (let i = 1; i <= engine.fileCount; i++) {
        const notation = fenRankArray[index];
        const notationNumber = parseInt(notation);
        // If the notation is a number, that many squares from this square contain no piece.
        // TODO Consider refactoring--export to function for readability
        if (!isNaN(notationNumber)) {
            lastNotationNumber += notationNumber;
            // Insert the next notation after the blank squares.
            if (!!fenRankArray[i + 1])
                fenRankArray[i + notationNumber] = fenRankArray[i + 1];
            // Insert blank squares from the current square, to currentSquare+notationNumber.
            for (let j = i; j < i + notationNumber; j++) {
                rank.squares[j] = { rank: rankNumber, file: j, piece: null, tags: {} };
            }
            i += notationNumber - 1;
            index++;
            continue;
        }
        rank.squares[i] = {
            rank: rankNumber,
            file: i,
            piece: engine.createPiece(notation, { file: i, rank: rankNumber }),
            tags: {}
        };
        index++;
    }
    return rank;
}
//# sourceMappingURL=fen.js.map