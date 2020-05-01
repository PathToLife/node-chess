"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upLeft = makeMove(-1, 1);
const upRight = makeMove(1, 1);
const downLeft = makeMove(-1, -1);
const downRight = makeMove(1, -1);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        incrementer: { file, rank }
    };
}
exports.bishop = {
    notation: "b",
    name: "Bishop",
    movement: [upLeft, upRight, downLeft, downRight],
    canQueen: false,
    canSpawn: false,
    value: 3,
    postMoveFunctions: []
};
//# sourceMappingURL=bishop.js.map