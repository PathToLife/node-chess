"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function boardToString(board) {
    let rankString = [];
    // Generate Axis X String
    let ranks = board.ranks[1];
    const fileIndices = ranks.squares.length - 1;
    let axisXNumbers = [...Array(fileIndices).keys()].map(i => `_${i + 1}_`);
    rankString.push(['-', ...axisXNumbers].join('|'));
    // Bottom to Top of Board
    board.ranks.forEach((rank, i) => {
        let s = '';
        // Generate Axis Y String
        s += `${i}|`;
        const pieces = [];
        // Left to right of board
        rank.squares.forEach(sq => {
            let p = sq.piece ? sq.piece.notation : '_';
            pieces.push(`_${p}_`);
        });
        s += pieces.join('|');
        rankString.push(s);
    });
    return rankString.reverse().join("\r\n");
}
exports.boardToString = boardToString;
function toString(boardState) {
    if (boardState)
        return boardToString(boardState);
    const ranks = [];
    const fileLabels = ['-'];
    for (let i = this.rankCount; i > 0; i--) {
        fileLabels[i] = "_" + i + "_";
        const pieces = [i];
        const rank = this.boardState.ranks[i];
        for (let p in rank.squares) {
            const s = rank.squares[p];
            let val = s.piece == null ? "_" : s.piece.notation;
            if (s.piece)
                val = s.piece.isWhite ? val.toUpperCase() : val.toLowerCase();
            pieces.push("_" + val + "_");
        }
        ranks.push(pieces.join("|"));
    }
    ranks.push(fileLabels.join("|"));
    return ranks.join("\r\n");
}
exports.default = toString;
//# sourceMappingURL=toString.js.map