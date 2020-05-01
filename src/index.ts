import Engine from './engine';
import classicEngine from './engine/instances/classic/engine';
import {Direction} from './enums';

export {boardToString} from './engine/helpers/toString';
export * from './types'

export {bishop} from './engine/instances/classic/bishop';
export {king} from './engine/instances/classic/king';
export {knight} from './engine/instances/classic/knight';
export {pawn} from './engine/instances/classic/pawn';
export {queen} from './engine/instances/classic/queen';
export {rook} from './engine/instances/classic/rook';
export * as classicRules from './engine/instances/classic/rules';

const chess = {
    Direction,
    Engine: Engine,
    classic: {
        engine: classicEngine,
    }
};

export default chess;
