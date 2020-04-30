"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get moves originating of the coordinate position
 * @param coordinate
 * @param boardState
 */
function getMoves(coordinate, boardState) {
    boardState = boardState || this.boardState;
    return boardState.moves
        .filter(move => move.from.file === coordinate.file && move.from.rank === coordinate.rank);
}
exports.default = getMoves;
//# sourceMappingURL=getMoves.js.map