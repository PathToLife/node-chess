"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Knight
 */
const upLeft = makeMove(-1, 2);
const upRight = makeMove(1, 2);
const downLeft = makeMove(-1, -2);
const downRight = makeMove(1, -2);
const leftUp = makeMove(-2, 1);
const leftDown = makeMove(-2, -1);
const rightUp = makeMove(2, 1);
const rightDown = makeMove(2, -1);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        transforms: { file, rank, canJump: true },
    };
}
exports.knight = {
    name: "Knight",
    movement: [upLeft, upRight, downLeft, downRight, leftUp, leftDown, rightUp, rightDown],
    canQueen: false,
    canSpawn: true,
    value: 3,
    notation: "n",
    postMoveFunctions: []
};
//# sourceMappingURL=knight.js.map