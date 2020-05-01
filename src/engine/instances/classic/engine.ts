import Engine from '../../index';
import {pawn} from "./pawn";
import {knight} from './knight';
import {bishop} from './bishop';
import {rook} from './rook';
import {queen} from './queen';
import {king} from './king';
import {postSuccessfulMoveFunction as checkGameEnd, postMoveFunction} from './rules';

/**
 * Engine Definition for classic chess
 */
export default function classEngine(): Engine {
	const board = new Engine();

	board.pieceDefinitions = [
		pawn, knight, bishop, rook, queen, king
	];

	board.parseFenString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

	board.postSuccessfulMoveFunctions = [checkGameEnd];

	board.boardState.postMoveFunctions.push(postMoveFunction)

	return board;
}
