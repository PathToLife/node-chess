"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the square for the given coordinate, null if not found (index out of range perhaps?)
 * @param coordinate
 * @param boardState
 */
function getSquare(coordinate, boardState) {
    boardState = boardState || this.boardState;
    if (!boardState.ranks[coordinate.rank])
        throw Error(`unable to get square for ${coordinate.rank} ${coordinate.file}`);
    return boardState.ranks[coordinate.rank].squares[coordinate.file];
}
exports.default = getSquare;
//# sourceMappingURL=getSquare.js.map