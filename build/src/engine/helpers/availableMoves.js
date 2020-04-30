"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns all squares where pieces can be moved, for both white and black
 * @param boardState
 */
function availableMoves(boardState) {
    boardState = boardState || this.boardState;
    let moves = [];
    boardState.ranks.forEach(rank => {
        rank.squares.forEach(square => {
            if (square.piece == null)
                return;
            moves = moves.concat(this.inferMoves(square.piece, boardState));
        });
    });
    boardState.moves = moves;
}
exports.default = availableMoves;
//# sourceMappingURL=availableMoves.js.map