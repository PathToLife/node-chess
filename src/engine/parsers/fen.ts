import Engine from '../index';
import {BoardState, Rank} from '../../types';
import {king} from '../instances/classic/king';
import {rook} from '../instances/classic/rook';

interface Fen {
    ranks: string[];
    turn: 'w' | 'b';
    castling: ('K' | 'Q' | 'k' | 'q' | '-')[];
    enpassant: string;
    halfMove: number;
    fullMove: number;
}

function hasRookMoved(boardState: BoardState, isWhite: boolean, isQueenSide: boolean): boolean {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        const sideQueen = piece.location.file === 0
        return piece.notation === rook.notation && piece.isWhite === isWhite && sideQueen === isQueenSide;
    })
}

function hasKingMoved(boardState: BoardState, isWhite: boolean): boolean {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        return piece.notation === king.notation && move.piece.isWhite === isWhite;
    })
}

/**
 * Converts the board state to a fen string
 * TODO enpassant
 */
export function stringifyToFenString(this: Engine): string {

    const fen: Fen = {
        ranks: [],
        turn: 'w',
        castling: [],
        enpassant: '-',
        halfMove: 0,
        fullMove: 0
    }

    this.boardState.ranks.slice().reverse().forEach(rank => {
        let rankRowPieces: string[] = []

        rank.squares.forEach(sq => {
            if (sq.piece == null) {
                rankRowPieces.push('-')
            } else {
                rankRowPieces.push(sq.piece.notation)
            }
        })

        rankRowPieces = rankRowPieces.reduce((accumulator: string[], currentValue) => {
            if (currentValue === '-') {
                const previousValueInt = Number(accumulator.slice(-1)[0])
                if (!isNaN(previousValueInt)) {
                    accumulator[accumulator.length - 1] = (previousValueInt + 1).toString()
                    return accumulator
                } else {
                    return [...accumulator, '1']
                }
            }
            return [...accumulator, currentValue]
        }, [])

        fen.ranks.push(rankRowPieces.join(''));
    })

    fen.turn = this.boardState.whitesTurn ? 'w' : 'b';

    if (!hasKingMoved(this.boardState, true)) {
        if (!hasRookMoved(this.boardState, true, false)) {
            fen.castling.push('K')
        }
        if (!hasRookMoved(this.boardState, true, true)) {
            fen.castling.push('Q')
        }
    }

    if (!hasKingMoved(this.boardState, false)) {
        if (!hasRookMoved(this.boardState, false, false)) {
            fen.castling.push('k')
        }
        if (!hasRookMoved(this.boardState, false, true)) {
            fen.castling.push('q')
        }
    }

    if (fen.castling.length === 0) {
        fen.castling.push('-')
    }

    fen.halfMove = this.boardState.moveHistory.length;
    fen.fullMove = this.boardState.moveNumber;

    const ranksStr = fen.ranks.join('/')
    const castingStr = fen.castling.join('');
    return `${ranksStr} ${fen.turn} ${castingStr} ${fen.enpassant} ${fen.halfMove} ${fen.fullMove}`
}

/**
 * Parses fen string and sets engine state accordingly
 * Does not load castling or enpassant info.. // Since this engine allows for variants
 * rnb1kbnr/ppp2ppp/8/3pP1q1/4P3/5P2/PPPK2PP/RNBQ1BNR b KQkq - 0 10
 * @param fenString - the fen string
 */
export function parseFromFenString(this: Engine, fenString: string): boolean | string {

    let fenClean = fenString.split(' ')
    fenClean = fenClean.map(s => s.trim())
    fenClean = fenClean.filter(s => s.length > 0);

    if (fenClean.length !== 6) return 'fen does not contain all 6 sections'

    const fen: Fen = {
        ranks: fenClean[0].split('/'),
        turn: fenClean[1].toLowerCase() === 'w' ? 'w' : 'b',
        castling: fenClean[2].split('') as any,
        enpassant: fenClean[3],
        halfMove: Number(fenClean[4]),
        fullMove: Number(fenClean[5])
    }

    if (fen.ranks.length !== 8) return 'fen board definition is not 8 sections'

    this.boardState.ranks = []

    fen.ranks.forEach((fileStr, i) => {
        const fileStrArr = fileStr.split('');

        const rankIndex = 8 - i;
        let fileIndex = 1;

        const rank: Rank = {
            rank: rankIndex,
            squares: []
        }

        fileStrArr.forEach(file => {

            if (!isNaN(Number(file))) {
                const endIndex = Number(file) + fileIndex;
                for (let i = fileIndex; i < endIndex; i++) {
                    rank.squares[fileIndex] = {
                        rank: rankIndex,
                        file: fileIndex,
                        piece: null,
                        tags: {}
                    }
                    fileIndex += 1;
                }
            } else { // param: file - is piece notation string
                rank.squares[fileIndex] = {
                    rank: rankIndex,
                    file: fileIndex,
                    piece: this.createPiece(file, {
                        file: fileIndex,
                        rank: rankIndex
                    }),
                    tags: {}
                };
                fileIndex += 1
            }
        })

        this.boardState.ranks[rankIndex] = rank;

    })

    this.boardState.whitesTurn = fen.turn === 'w';

    this.populateAvailableMoves();
    this.postSuccessfulMoveFunctions.forEach(func => func.action(null, this.boardState, this))

    return true
}

// @deprecated delete later on, bugged loading
// function createFilesForRank(engine: Engine, fenRank: string, rankNumber: number): Rank {
//     const rank: Rank = {
//         rank: rankNumber,
//         squares: []
//     }
//     const fenRankArray = fenRank.split('');
//
//     let lastNotationNumber = 0;
//     let index = 0;
//     for (let i = 1; i <= engine.fileCount; i++) {
//         const notation = fenRankArray[index];
//         const notationNumber = parseInt(notation);
//
//         // If the notation is a number, that many squares from this square contain no piece.
//         // TODO Consider refactoring--export to function for readability
//         if (!isNaN(notationNumber)) {
//             lastNotationNumber += notationNumber;
//             // Insert the next notation after the blank squares.
//             if (!!fenRankArray[i + 1]) fenRankArray[i + notationNumber] = fenRankArray[i + 1];
//
//             // Insert blank squares from the current square, to currentSquare+notationNumber.
//             for (let j = i; j < i + notationNumber; j++) {
//                 rank.squares[j] = {rank: rankNumber, file: j, piece: null, tags: {}};
//             }
//             i += notationNumber - 1;
//             index++;
//             continue;
//         }
//         rank.squares[i] = {
//             rank: rankNumber,
//             file: i,
//             piece: engine.createPiece(notation, {file: i, rank: rankNumber}),
//             tags: {}
//         };
//         index++;
//     }
//     return rank;
// }
