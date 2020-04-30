import Engine from '../index';
import { BoardState, Move, BoardPiece } from '../../types';
/**
 * Check piece move can be made based off a pre-processed list of valid moves
 * Therefore it's possible to run an invalid board state as long as the moves are valid
 *
 * @param move
 * @param _boardState
 */
declare type TCalculateMovePieceResult = {
    newBoardState: BoardState;
    pieceAfterMove: BoardPiece;
} | null;
export declare function calculateMovePiece(this: Engine, move: Move, _boardState: BoardState): TCalculateMovePieceResult;
export default function movePiece(this: Engine, move: Move): BoardState | null;
export {};
