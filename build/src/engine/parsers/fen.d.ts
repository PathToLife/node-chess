import Engine from '../index';
/**
 * Converts the board state to a fen string
 * TODO enpassant
 */
export declare function stringifyToFenString(this: Engine): string;
/**
 * Parses fen string and sets engine state accordingly
 * Does not load castling or enpassant info.. // Since this engine allows for variants
 * rnb1kbnr/ppp2ppp/8/3pP1q1/4P3/5P2/PPPK2PP/RNBQ1BNR b KQkq - 0 10
 * @param fenString - the fen string
 */
export declare function parseFromFenString(this: Engine, fenString: string): boolean | string;
