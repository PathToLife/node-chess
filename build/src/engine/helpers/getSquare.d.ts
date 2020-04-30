import Engine from '../index';
import { Coordinate, BoardState, Square } from '../../types';
/**
 * Returns the square for the given coordinate, null if not found (index out of range perhaps?)
 * @param coordinate
 * @param boardState
 */
export default function getSquare(this: Engine, coordinate: Coordinate, boardState?: BoardState): Square;
