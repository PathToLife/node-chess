import Engine from './engine';
import classicEngine from './engine/instances/classic/engine';
import { Direction } from './enums';
declare const chess: {
    Direction: typeof Direction;
    Engine: typeof Engine;
    classic: {
        engine: typeof classicEngine;
    };
};
export default chess;
