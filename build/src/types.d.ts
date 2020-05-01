import BasePiece from './engine/basePiece';
import Engine from './engine';
export interface BoardState {
    ranks: Rank[];
    tags: BoardTag;
    moveNumber: number;
    whitesTurn: boolean;
    capturedPieces: BoardPiece[];
    postMoveFunctions: MoveFunction[];
    preMoveFunctions: MoveFunction[];
    moves: Move[];
    winnerIsWhite?: boolean;
    gameIsDrawn?: boolean;
    moveHistory: MoveHistory[];
}
export interface BoardTag {
    initialPieceCount: number;
    inCheckSquares: Move[];
    gameEndReason: null | TGameEndReason;
}
export declare type MoveFunctionAction = (piece: BoardPiece, boardState: BoardState, board: Engine) => any;
export interface MoveFunction {
    moveNumber?: number;
    action: MoveFunctionAction;
}
export interface Coordinate {
    file: number;
    rank: number;
    [axis: string]: number;
}
export interface Rank {
    rank: number;
    squares: Square[];
}
export interface Square {
    rank: number;
    file: number;
    piece: BasePiece | null;
    tags: {
        [key: string]: boolean | string;
    };
}
export interface Move {
    from: Coordinate;
    to: Coordinate;
    options?: any;
    postMoveActions?: MoveFunction[];
    isWhite?: boolean;
}
export interface MoveHistory {
    from: Coordinate;
    to: Coordinate;
    options?: any;
    piece: BoardPiece;
}
/**
 * Piece Definition
 */
export interface IPiece {
    name: string;
    movement: MoveDefinition[];
    notation: string;
    value: number;
    canQueen: boolean;
    canSpawn: boolean;
    postMoveFunctions: MoveFunction[];
}
/**
 * Piece on Board Representation Definition
 */
export interface BoardPiece extends IPiece {
    id: number;
    location: Coordinate;
    isWhite: boolean;
    getRelativeDestination: (transform: Coordinate) => Coordinate;
    getAbsoluteDestination: (transform: Coordinate) => Coordinate;
}
/**
 * Specify behaviour of piece
 */
export interface MoveDefinition {
    transforms?: Transform | Transform[];
    incrementer?: Increment;
    canMove?: boolean;
    canCapture?: boolean;
    postMoveAction?: MoveFunction;
    preCondition?: MoveCondition;
    postCondition?: MoveCondition;
    useDefaultConditions?: boolean;
}
export interface Increment {
    file: number;
    rank: number;
    absolute?: boolean;
    limit?: number;
    canJump?: boolean;
}
export interface Transform {
    file: number;
    rank: number;
    absolute?: boolean;
    squaresBetween?: boolean;
    canJump?: boolean;
}
export interface MoveCondition {
    (piece: BasePiece, boardState: BoardState, board: Engine): boolean;
}
/**
 * @param direction The direction of movement from the perspective of the piece owner
 * @param count Number of squares in the direction. 0: All squares (e.g. rooks, queens, bishops). Otherwise 1 .. N. SingleMoves with negative numbers are ignored.
 * */
export interface SingleMove {
    direction: number;
    count: number;
}
/**
 * @param interval The callback frequency in milliseconds. 100ms default.
 * @param depth The maximum ply-depth that the analysis will reach. 5 by default.
 * @param time The maxmium calculation time. The engine will stop analysing the position after this time in seconds. 5s default.
 */
export interface AnalysisOptions {
    interval?: number;
    depth?: number;
    time?: number;
}
export interface PositionParser {
    (position?: string): void;
}
export interface StringParser {
    parse(position: string): BoardInput;
}
export interface BoardInput {
    ranks: string[];
    turn: string;
    castling: string[];
    halfMove: number;
    fullMove: number;
}
export interface Rule {
    (): boolean;
}
