import Board = require("./board");
export enum Direction {
	Up, Down, Left, Right, DiagonalUp, DiagonalDown, Lateral, Horizontal, Vertical, Diagonal
}
/**
 * Defines a single move that a piece can perform
 */
export interface PieceMovement {
	movePatterns: MovePattern[];
}

export interface Coordinate {
	file: number; // Board x-axis
	rank: number; // Board y-axis
}

export interface Rank {
	rank: number;
	squares: Square[];
}

export interface Square {
	file: number;
	piece: Piece
;}

export class PieceFactory {
	constructor(piece: Piece) {
		this.piece = piece;
		this.notation = piece.notation;
	}

	create(isWhite?: boolean): Piece {
		return {
			name: this.piece.name,
			movement: this.piece.movement,
			canQueen: this.piece.canQueen,
			canSpawn: this.piece.canSpawn,
			value: this.piece.value,
			isWhite: isWhite,
			notation: this.notation
		}
	}

	piece: Piece;
	notation: string;
}

export interface Piece {
	name: string;
	movement: MovePattern[];
	notation: string;
	value: number;
	canQueen: boolean;
	canSpawn: boolean;
	isWhite?: boolean;
	originalPosition?: Coordinate;
}

/**
 * @param moves The complete pattern of movement
 * @param canJump Can the piece jump over pieces to reach the location
 * @param canMove Can the piece move there without capturing
 * @param canCapture Can the piece capture at the location
 */ 
export interface MovePattern {
	moves: SingleMove[];
	canJump?: boolean;
	canCapture?: boolean;
	canMove?: boolean;
}
/**
 * @param direction The direction of movement from the perspective of the piece owner
 * @param count Number of squares in the direction. 0: All squares (e.g. rooks, queens, bishops). Otherwise 1 .. N. SingleMoves with negative numbers are ignored.
 * */ 
export interface SingleMove {
	direction: Direction;
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
	parse(position: string): any;
	defaultPosition: string;
}

export interface StringParser {
	parse(position: string): BoardInput;
}

export interface BoardInput {
	ranks: string[];
	turn: Turn;
	castling: Castling[];
	halfMove: number;
	fullMove: number;
}

export enum Turn {
	White = <any>"w",
	Black = <any>"b"
}

export enum Castling {
	WhiteKingSide = <any>"K",
	WhiteQueenSide = <any>"Q",
	BlackKingSide = <any>"k",
	BlackQueenSide = <any>"q"
}

export interface Rule {
	(): boolean;
}