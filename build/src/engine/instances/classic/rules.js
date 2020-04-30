"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pawn_1 = require("./pawn");
/**
 * Classic Chess Game Rules
 */
const postMoveFunction = {
    action: (piece, boardState, board) => {
        return processIsGameOver(boardState, board);
    }
};
exports.default = postMoveFunction;
/**
 * Check if move a move is allowed
 *
 * Internally tries to create a new board state
 * Then checks if inCheck
 *
 * @param move
 * @param boardState
 * @param board
 */
function isMoveAllowed(move, boardState, board) {
    const turn = boardState.whitesTurn;
    if (turn !== move.isWhite)
        return false;
    try {
        // Try get future board state
        const res = board.calculateMovePiece(move, boardState);
        if (!res)
            return false;
        // In check
        const check = isCheck(turn, res.newBoardState);
        return !check;
    }
    catch (ex) {
        // No king due to being captured
        return false;
    }
}
/**
 * Get all possible moves on the board
 * @param boardState
 * @param board
 */
function allowedMoves(boardState, board) {
    function isLegit(move) {
        return isMoveAllowed(move, boardState, board);
    }
    return boardState.moves.filter(isLegit);
}
/**
 * Checks if the game is over and assigns the associated states
 * @param boardState
 * @param board
 */
function processIsGameOver(boardState, board) {
    const fiftyMoveStalemate = fiftyMoveRule(boardState);
    if (fiftyMoveStalemate) {
        boardState.gameIsDrawn = true;
        boardState.moves = []; // this should be already set to empty?
        return true;
    }
    const isInCheck = isCheck(boardState.whitesTurn, boardState);
    const moves = allowedMoves(boardState, board);
    const hasMoves = moves.length > 0;
    if (hasMoves)
        return false;
    boardState.moves = [];
    if (isInCheck) {
        boardState.winnerIsWhite = !boardState.whitesTurn;
    }
    else {
        boardState.gameIsDrawn = true;
    }
    return true;
}
/**
 * Check is side is inCheck given a board state
 * @param checkWhite
 * @param boardState
 */
function isCheck(checkWhite, boardState) {
    let kingSquare = undefined;
    for (let rx = 1; rx <= 8; rx++) {
        const rank = boardState.ranks[rx];
        for (let sx = 1; sx <= 8; sx++) {
            const square = rank.squares[sx];
            if (!square.piece)
                continue;
            const isKing = square.piece.name === "King" && square.piece.isWhite === checkWhite;
            if (isKing)
                kingSquare = square;
        }
    }
    if (!kingSquare)
        throw Error("Unable to locate opposing king");
    const kingAttackers = boardState.moves.filter((move) => {
        if (kingSquare == null)
            return;
        return move.to.file === kingSquare.file && move.to.rank === kingSquare.rank;
    });
    return kingAttackers.length > 0;
}
function fiftyMoveRule(state) {
    if (state.moveHistory.length < 50)
        return false;
    const lastFiftyMoves = state.moveHistory.slice(-50);
    return !lastFiftyMoves.some(isPawn);
}
function isPawn(move) {
    return move.piece.notation === pawn_1.default.notation;
}
//# sourceMappingURL=rules.js.map