"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const up = makeMove(0, 1);
const down = makeMove(0, -1);
const left = makeMove(-1, 0);
const right = makeMove(1, 0);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        incrementer: { file, rank }
    };
}
exports.rook = {
    notation: "r",
    name: "Rook",
    movement: [up, down, left, right],
    canQueen: false,
    canSpawn: false,
    value: 5,
    postMoveFunctions: []
};
//# sourceMappingURL=rook.js.map