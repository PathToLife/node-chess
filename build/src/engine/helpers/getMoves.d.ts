import Engine from '../index';
import { Coordinate, BoardState } from '../../types';
/**
 * Get moves originating of the coordinate position
 * @param coordinate
 * @param boardState
 */
export default function getMoves(this: Engine, coordinate: Coordinate, boardState?: BoardState): import("../../types").Move[];
