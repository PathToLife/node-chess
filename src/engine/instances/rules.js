/**
 * If the board has the 'check' tag,
 */
exports.checkmatePostMove = {
    action: function (piece, boardState, board) {
        var isGameOver = isCheckmate(boardState, board);
        if (!isGameOver)
            return false;
        boardState.winnerIsWhite = !boardState.whitesTurn;
        boardState.moves = [];
        return true;
    }
};
exports.stalematePostMove = {
    action: function (piece, boardState, board) {
        var isGameOver = isStalement(boardState, board);
        if (!isGameOver)
            return false;
        boardState.winnerIsWhite = !boardState.whitesTurn;
        boardState.moves = [];
        return true;
    }
};
function isMoveAllowed(move, boardState, board) {
    if (boardState.whitesTurn !== move.isWhite)
        return false;
    var isInCheck = isCheck(boardState.whitesTurn, boardState);
    if (!isInCheck)
        return true;
    try {
        var future = board.movePiece(move.from, move.to, boardState);
        var futureIsInCheck = isCheck(boardState.whitesTurn, future);
        return !futureIsInCheck;
    }
    catch (ex) {
        return false;
    }
}
function allowedMoves(boardState, board) {
    var isLegit = function (move) { return isMoveAllowed(move, boardState, board); };
    var legitMoves = boardState.moves.filter(isLegit);
    return legitMoves;
}
function isCheckmate(boardState, board) {
    var isInCheck = isCheck(boardState.whitesTurn, boardState);
    if (!isInCheck)
        return false;
    var moves = allowedMoves(boardState, board);
    var hasMoves = moves.length > 0;
    return isInCheck && !hasMoves;
}
function isStalement(boardState, board) {
    var isInCheck = isCheck(boardState.whitesTurn, boardState);
    if (isInCheck)
        return false;
    var moves = allowedMoves(boardState, board);
    var hasMoves = moves.length > 0;
    return !isInCheck && !hasMoves;
}
function isCheck(checkWhite, boardState) {
    var kingSquare;
    boardState.ranks.forEach(function (rank) {
        rank.squares.forEach(function (square) {
            if (!square.piece)
                return;
            var isKing = square.piece.name === "King" && square.piece.isWhite === checkWhite;
            if (isKing)
                kingSquare = square;
        });
    });
    if (!kingSquare)
        throw new Error("Unable to locate opposing king");
    var attackFilter = function (move) { return move.to.file === kingSquare.file && move.to.rank === kingSquare.rank; };
    var kingAttackers = boardState.moves.filter(attackFilter);
    var isInCheck = kingAttackers.length > 0;
    return isInCheck;
}
//# sourceMappingURL=rules.js.map