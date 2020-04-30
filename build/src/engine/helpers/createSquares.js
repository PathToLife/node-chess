"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Init board size
 */
function createSquares() {
    this.boardState.ranks = [];
    for (let rank = 0; rank < this.rankCount; rank++) {
        const row = {
            rank: rank,
            squares: []
        };
        for (let file = 0; file < this.fileCount; file++) {
            row.squares[file + 1] = {
                rank: rank,
                file: file,
                piece: null,
                tags: {}
            };
        }
        this.boardState.ranks[rank + 1] = row;
    }
}
exports.default = createSquares;
//# sourceMappingURL=createSquares.js.map