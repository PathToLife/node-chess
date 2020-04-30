"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const up = makeMove(0, 1);
const down = makeMove(0, -1);
const left = makeMove(-1, 0);
const right = makeMove(1, 0);
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
const queen = {
    notation: "q",
    name: "Queen",
    movement: [upLeft, upRight, downLeft, downRight, up, down, left, right],
    canQueen: false,
    canSpawn: false,
    value: 9,
    postMoveFunctions: []
};
exports.default = queen;
//# sourceMappingURL=queen.js.map