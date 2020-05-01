import {
    MoveFunction,
    BoardState,
    BoardTag,
    IPiece, BoardFunctionAction
} from '../types';
import toString from './helpers/toString';
import getMoves from './helpers/getMoves';
import inferMoves from './helpers/inferMoves';
import movePiece, {calculateMovePiece} from './helpers/movePiece';
import {parseFromFenString, stringifyToFenString} from './parsers/fen';
import createSquares from './helpers/createSquares';
import PieceFactory from './basePiece';
import availableMoves from './helpers/availableMoves';
import getSquare from './helpers/getSquare';
import createPiece from './helpers/createPiece';

/**
 * Board: extensible board (TODO: more detail)
 */
export default class Engine {
    constructor() { }

    uciEngine: UCIEngine | null = null;
    rankCount: number = 8;
    fileCount: number = 8;
    postSuccessfulMoveFunctions: MoveFunction<BoardFunctionAction>[] = [];

    boardState: BoardState = {
        ranks: [],
        tags: {
            inCheckSquares: [],
            initialPieceCount: 0,
            gameEndReason: null
        },
        capturedPieces: [],
        whitesTurn: true,
        moveNumber: 1,
        preMoveFunctions: [],
        postMoveFunctions: [],
        moves: [],
        moveHistory: []
    }

    pieceDefinitions: IPiece[] = [];
    pieceFactory = PieceFactory;

    parseFenString = parseFromFenString.bind(this);
    stringifyFenString = stringifyToFenString.bind(this);

    movePiece = movePiece.bind(this);
    calculateMovePiece = calculateMovePiece.bind(this);

    getSquare = getSquare.bind(this);
    getMoves = getMoves.bind(this);

    create = createSquares.bind(this);
    inferMoves = inferMoves.bind(this);
    toString = toString.bind(this);

    populateAvailableMoves = availableMoves.bind(this);
    createPiece = createPiece.bind(this);

    analyzer = (uciEngine: UCIEngine) => {
        this.uciEngine = uciEngine;
    }
}

interface UCIEngine {
    postMessage: (command: string) => void;
    onmessage: (event: UCIEvent) => void;
}

interface UCIEvent {
    data: string;
}

