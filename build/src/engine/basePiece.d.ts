import { IPiece, Coordinate, Move, MoveFunction, MoveDefinition, BoardPiece } from '../types';
export default class BasePiece implements BoardPiece {
    constructor(piece: IPiece, notation: string);
    id: number;
    location: Coordinate;
    name: string;
    movement: MoveDefinition[];
    canQueen: boolean;
    canSpawn: boolean;
    value: number;
    notation: string;
    moveHistory: Move[];
    isWhite: boolean;
    postMoveFunctions: MoveFunction[];
    getRelativeDestination(transform: Coordinate): Coordinate;
    getAbsoluteDestination(transform: Coordinate): Coordinate;
}
