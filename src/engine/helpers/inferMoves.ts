import Engine from '../index';
import BasePiece from '../basePiece';
import {
	BoardState,
	Move,
	MoveDefinition,
	Transform,
	BoardPiece,
	Coordinate
} from '../../types';

/**
 * Intentionally not using any closures to improve performance
 * This code can potentially be called thousands of times after a single move has been played
 */
export default function infer(this: Engine, piece: BasePiece, state?: BoardState) {
	state = state || this.boardState;
	const moves: Move[] = [];

	for (let key in piece.movement) {
		const move = piece.movement[key];

		let canProcess = true;
		if (move.preCondition)
			canProcess = move.preCondition(piece, state, this);

		if (move.transforms) {
			// Pre-conditions only apply to
			if (!canProcess) continue;

			const newMove = processTransform(move, piece, state, this);
			if (newMove) moves.push(newMove);
		}
		else {
			const newMoves = processIncrementer(move, piece, state, this);

			if (move.postMoveAction) {
				for (let x = 0; x < newMoves.length; x++) {
					newMoves[x].postMoveActions = [move.postMoveAction]
				}
			}

			moves.push(...newMoves);
		}
	}

	return moves;
}

function processTransform(move: MoveDefinition, piece: BoardPiece, boardState: BoardState, board: Engine) {

	if (!move.transforms) return;

	const modifier = piece.isWhite ? 1 : -1;
	const finalMove: Move = {
		from: copyCoord(piece.location),
		to: copyCoord(piece.location), // this will be overwritten later
		isWhite: piece.isWhite
	};

	const canSkipLogic = move.preCondition && !move.useDefaultConditions;

	if (move.postMoveAction)
		finalMove.postMoveActions = [move.postMoveAction];

	// Stores all possible transform destinations for the piece, without any checks, except out of bounds
	const steps = [piece.location];

	let transforms: Transform[] = [];

	if (!Array.isArray(move.transforms)) {
		transforms.push(move.transforms)
	} else {
		transforms = move.transforms;
	}

	for (let x = 0; x < transforms.length; x++) {
		const transform = transforms[x];
		const appliedTransform = applyTransform(steps[x], transform, modifier);
		if (!isInBounds(appliedTransform)) return null;

		steps.push(appliedTransform);
	}

	const finalCoord = steps[steps.length - 1];
	finalMove.to = finalCoord;

	// if (finalCoord.file == 7 && finalCoord.rank == 4 && piece.name == 'Pawn') {
	// 	debugger;
	// }
	// Pre-condition has passed and useDefaultConditions is false.
	if (canSkipLogic) return finalMove;

	const finalSquare = board.getSquare(finalCoord, boardState);
	if (!finalSquare) return null;
	const finalSquarePiece = finalSquare.piece;

	const canCaptureOnFinalSquare = move.canCapture && finalSquarePiece && finalSquarePiece.isWhite != piece.isWhite;
	if (canCaptureOnFinalSquare) return finalMove;

	const canMoveButSquareOccupied = move.canMove && finalSquarePiece;
	if (canMoveButSquareOccupied) return null;

	for (let x = 1; x < steps.length; x++) {
		const prev = steps[x - 1];
		const step = steps[x];
		const transform = transforms[x - 1];

		// Not sure what this does
		// if (step !== finalCoord) {
		// 	//TODO: Allow 'squaresBetween' here
		// 	if (transform.canJump) continue;
		//
		// 	if (transform.squaresBetween) {
		// 		const canMove = checkBetween(
		// 			prev,
		// 			step,
		// 			piece,
		// 			transform,
		// 			boardState,
		// 			board);
		//
		// 		if (!canMove) return null;
		// 	}
		//
		// 	continue;
		// }

		// Logic when analyzing the final step in a MoveDefinition

		// If we can jump, don't checkBetween
		if (transform.canJump) return finalMove;

		if (transform.squaresBetween) {
			const canMove = checkBetween(
				prev,
				step,
				piece,
				transform,
				boardState,
				board);

			if (!canMove) return null;
		}

		const isFinalSquareVacant = finalSquare.piece == null;
		if (move.canMove && isFinalSquareVacant)
			return finalMove;

		const isFinalSquareOccupiedByEnemy = finalSquare.piece && finalSquare.piece.isWhite !== piece.isWhite;
		if (move.canCapture && isFinalSquareOccupiedByEnemy) return finalMove;
	}

	return null;
}

function processIncrementer(move: MoveDefinition, piece: BoardPiece, state: BoardState, board: Engine): Move[] {

	if (!move.incrementer) return [];

	let currCoords: Coordinate = { file: piece.location.file, rank: piece.location.rank };
	const modifier = piece.isWhite || move.incrementer.absolute ? 1 : -1;

	const file = move.incrementer.file * modifier;
	const rank = move.incrementer.rank * modifier;
	const validMoves: Move[] = [];

	while (true) {
		currCoords.file += file;
		currCoords.rank += rank;
		if (!isInBounds(currCoords)) break;
		const square = board.getSquare(currCoords, state);

		if (square.piece) {

			if (square.piece.isWhite !== piece.isWhite) {
				if (!move.canCapture && !move.incrementer.canJump) break;

				validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });

				// If we can jump, we can possibly go to the next square, otherwise terminate the incrementer here.
				if (move.incrementer.canJump) continue;
				else break;
			}

			if (square.piece.isWhite === piece.isWhite) {
				if (!move.incrementer.canJump) break;

				// Do not add the move here: we can jump, but we can't move to this square
				//validMoves.push({ from: copyCoord(piece.location), to: { file: current.file, rank: current.rank }, isWhite: piece.isWhite });
				continue;
			}

			if (move.canCapture) {
				validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });
				continue;
			}

			break;
		}

		if (move.canMove) {
			validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });
			continue;
		}

		break;
	}

	return validMoves;
}

export function isInBounds(position: Coordinate): boolean {
	return position.file > 0 && position.file <= 8
		&& position.rank > 0 && position.rank <= 8;
}

// TODO: Shrink function signature. Take an object instead
function checkBetween(start: Coordinate, end: Coordinate, piece: BoardPiece, transform: Transform, boardState: BoardState, board: Engine) {
	const difference = {
		file: Math.abs(start.file - end.file),
		rank: Math.abs(start.rank - end.rank)
	};

	// Diagonal jumps not supported currently for in between checks.
	// Knights are valid because we don't check between for them.
	if (difference.file > 0 && difference.rank > 0)
		throw Error(`Invalid non-jumpable move in ${piece.name} definition: ${JSON.stringify(transform)}`);

	// if (end.file == 7 && end.rank == 4 && piece.name == 'Pawn') {
	// 	debugger;
	// }

	if (difference.file === 1 || difference.rank === 1) return false;

	const dimension = difference.file > 0 ? "file" : "rank";
	const inc = end[dimension] > start[dimension] ? -1 : 1;

	// Ensure all squares between current and previous are vacant
	// Avoid closures to avoid heap allocations
	for (let y = end[dimension]; y !== start[dimension]; y += inc) {
		const between: Coordinate = { file: end.file, rank: end.rank };
		between[dimension] += inc;
		const sq = board.getSquare(between, boardState);

		// If a square is occupied, the move is not valid
		if (sq.piece) return false;
	}

	// All squares are vacant
	return true;
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

function copyCoord(coord: Coordinate) {
	return {
		file: coord.file,
		rank: coord.rank
	};
}
