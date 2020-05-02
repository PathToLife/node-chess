import Engine from '../../index';
import {
	MoveDefinition,
	Coordinate,
	BoardState,
	IPiece, BoardPiece, MoveFunctionAction, Transform
} from '../../../types';
import {queen} from './queen';
import {isInBounds} from "../../helpers/inferMoves";

/**
 * Pawn with enpassant, promote, first-move support
 */

const moveForward: MoveDefinition = {
	canMove: true,
	transforms: { file: 0, rank: 1 },
	postMoveAction: {
		action: (piece, state, board) => {
			const move = state.moveHistory.slice(-1)[0];
			if (!move || move.to.rank !== 1 && move.to.rank !== 8) return;

			const promotionNotation = (<string>move.options || queen.notation).toLowerCase();
			let promotionPiece = board.pieceDefinitions.filter(p => p.notation === promotionNotation)[0];

			if (!promotionPiece) {
				promotionPiece = board.pieceDefinitions.filter(p => p.notation === queen.notation)[0];
			}

			piece.canQueen = false;
			piece.canSpawn = true;
			piece.movement = promotionPiece.movement;
			piece.notation = promotionPiece.notation;
			piece.postMoveFunctions = promotionPiece.postMoveFunctions;
			piece.value = promotionPiece.value;
			piece.name = promotionPiece.name;
		}
	}
}

function applyTransform(coordinate: Coordinate, transform: Transform, modifier: number) {
	if (transform.absolute) modifier = 1;

	const file = coordinate.file + (transform.file * modifier);
	const rank = coordinate.rank + (transform.rank * modifier);

	return {
		file,
		rank
	};
}

const firstMove: MoveDefinition = {
	canMove: true,
	canCapture: false,
	transforms: { file: 0, rank: 2, canJump: false, squaresBetween: true },
	useDefaultConditions: true,
	preCondition: (piece, boardState) => {

		const hasPreviousMoves = boardState.moveHistory.filter(m => m.piece.id === piece.id).length !== 0;
		if (hasPreviousMoves) return false;

		const modifier = piece.isWhite ? 1 : -1;

		const nextCoords = applyTransform(piece.location, { file: 0, rank: 2, canJump: false }, modifier);

		return true;
	},
	postMoveAction: {
		action: (piece, state, board) => {
			const coordBehindPawn = piece.getRelativeDestination({ file: 0, rank: -1 })
			const squareBehindPawn = board.getSquare(coordBehindPawn, state);
			squareBehindPawn.tags["enpassant"] = true;

			state.postMoveFunctions.push({
				moveNumber: state.moveNumber + 1,
				action: (piece, innerState, innerBoard) => {
					const sq = innerBoard.getSquare({file: coordBehindPawn.file, rank: coordBehindPawn.rank }, innerState);
					delete sq.tags["enpassant"];
				}
			})
		}
	}
}

const leftCapture: MoveDefinition = {
	canCapture: true,
	transforms: { file: 1, rank: 1 }
}

const rightCapture: MoveDefinition = {
	canCapture: true,
	transforms: { file: -1, rank: 1 }
}

const makeEnpassantPreMove = (dir: Coordinate): MoveFunctionAction => {
	return (piece: BoardPiece, state: BoardState, board: Engine) => {
		const coord = piece.getRelativeDestination(dir);
		if (!isInBounds(coord)) return false;
		const sq = board.getSquare(coord, state);
		return !!sq.tags["enpassant"];
	}
}

const enpassantPostMove: MoveFunctionAction = (piece: BoardPiece, state: BoardState, board: Engine) => {
	const coord = piece.getRelativeDestination({ file: 0, rank: -1 });
	const square = board.getSquare(coord, state);

	if (square.piece === null) throw Error(`enpassant postMove fail, expected target piece to be on square ${coord.rank} ${coord.file}, instead got null`)

	state.capturedPieces.push(square.piece);
	square.piece = null;
}

const leftEnpassant: MoveDefinition = {
	canCapture: true,
	transforms: { file: -1, rank: 1 },
	preCondition: makeEnpassantPreMove({ file: -1, rank: 1 }),
	postMoveAction: {
		action: enpassantPostMove
	}
}

const rightEnpassant: MoveDefinition = {
	canCapture: true,
	transforms: { file: 1, rank: 1 },
	preCondition: makeEnpassantPreMove({ file: 1, rank: 1 }),
	postMoveAction: {
		action: enpassantPostMove
	}
}

export const pawn: IPiece = {
	notation: "p",
	name: "Pawn",
	movement: [moveForward, firstMove, leftCapture, rightCapture, leftEnpassant, rightEnpassant],
	canQueen: true,
	canSpawn: false,
	value: 1,
	postMoveFunctions: []
}
