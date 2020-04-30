import Engine from '../index';
/**
 * Converts the board state to a fen string
 * TODO enpassant
 */
export declare function stringifyToFenString(this: Engine): string;
/**
 * Parses fen string and sets engine state accordingly
 * Does not load castling or enpassant info.. // Since this engine allows for variants
 *
 * @param position - the fen string
 */
export declare function parseFromFenString(this: Engine, position?: string): void;
