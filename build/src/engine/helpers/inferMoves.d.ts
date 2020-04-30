import Engine from '../index';
import BasePiece from '../basePiece';
import { BoardState, Move, Coordinate } from '../../types';
/**
 * Intentionally not using any closures to improve performance
 * This code can potentially be called thousands of times after a single move has been played
 */
export default function infer(this: Engine, piece: BasePiece, state?: BoardState): Move[];
export declare function isInBounds(position: Coordinate): boolean;
