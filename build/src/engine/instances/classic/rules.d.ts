import { BoardFunctionAction, MoveFunction } from '../../../types';
/**
 * Classic Chess Game Rules
 */
/**
 * Checks if player is still in check after a move
 */
export declare const postMoveFunction: MoveFunction;
export declare const postSuccessfulMoveFunction: MoveFunction<BoardFunctionAction>;
