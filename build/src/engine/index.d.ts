import { MoveFunction, BoardState, IPiece } from '../types';
import PieceFactory from './basePiece';
/**
 * Board: extensible board (TODO: more detail)
 */
export default class Engine {
    constructor();
    uciEngine: UCIEngine | null;
    rankCount: number;
    fileCount: number;
    postMoveFunctions: MoveFunction[];
    boardState: BoardState;
    pieceDefinitions: IPiece[];
    pieceFactory: typeof PieceFactory;
    parseFenString: (position?: string | undefined) => void;
    stringifyFenString: () => string;
    movePiece: (move: import("../types").Move) => BoardState | null;
    calculateMovePiece: (move: import("../types").Move, _boardState: BoardState) => {
        newBoardState: BoardState;
        pieceAfterMove: import("../types").BoardPiece;
    } | null;
    getSquare: (coordinate: import("../types").Coordinate, boardState?: BoardState | undefined) => import("../types").Square;
    getMoves: (coordinate: import("../types").Coordinate, boardState?: BoardState | undefined) => import("../types").Move[];
    create: () => void;
    inferMoves: (piece: PieceFactory, state?: BoardState | undefined) => import("../types").Move[];
    toString: () => string;
    populateAvailableMoves: (boardState?: BoardState | undefined) => void;
    createPiece: (notation: string, location: import("../types").Coordinate) => PieceFactory;
    analyzer: (uciEngine: UCIEngine) => void;
}
interface UCIEngine {
    postMessage: (command: string) => void;
    onmessage: (event: UCIEvent) => void;
}
interface UCIEvent {
    data: string;
}
export {};
