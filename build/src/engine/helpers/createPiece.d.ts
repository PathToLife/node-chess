import Engine from '../index';
import BasePiece from '../basePiece';
import { Coordinate } from '../../types';
/**
 * Finds the piece in engine definition and initializes it at the given location
 * @throws Error piece not found
 * @param notation
 * @param location
 */
export default function createPiece(this: Engine, notation: string, location: Coordinate): BasePiece;
