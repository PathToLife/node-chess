import Engine from '../../index';
import {
    Piece,
    BoardState,
    Move,
    Square,
    MoveHistory
} from '../../../types';
/**
 * If the board has the 'check' tag,
 */

export default {
    action: (piece: Piece, boardState: BoardState, board: Engine) => {
        var gameState = isGameOver(boardState, board);
        return gameState;
    }
}
function isMoveAllowed(move: Move, boardState: BoardState, board: Engine) {
    var turn = boardState.whitesTurn;
    if (turn !== move.isWhite) return false;

    try {
        var future = board.movePiece(move, boardState);
        if (!future) return false;
        var futureIsInCheck = isCheck(turn, future);
        return !futureIsInCheck;

    } catch (ex) {
        // No king due to being captured
        return false;
    }
}

function allowedMoves(boardState: BoardState, board: Engine) {

    function isLegit(move: Move) {
        return isMoveAllowed(move, boardState, board);
    }

    var legitMoves = boardState.moves.filter(isLegit);
    return legitMoves;
}

function isGameOver(boardState: BoardState, board: Engine) {
    var fiftyMoveStalement = fiftyMoveRule(boardState, board);
    if (fiftyMoveStalement) {
        boardState.gameIsDrawn = true;
        boardState.moves = [];
        return true;
    }

    var isInCheck = isCheck(boardState.whitesTurn, boardState);
    // if (!isInCheck) return false;
    var moves = allowedMoves(boardState, board);

    var hasMoves = moves.length > 0;
    if (hasMoves) return false;

    boardState.moves = [];
    if (isInCheck) {
        boardState.winnerIsWhite = !boardState.whitesTurn
    } else {
        boardState.gameIsDrawn = true;
    }
    return true;
}

function isCheck(checkWhite: boolean, boardState: BoardState) {
    var kingSquare: Square;

    //TODO: Optimise--remove closures
    for (var rx = 1; rx <= 8; rx++) {
        var rank = boardState.ranks[rx];

        for (var sx = 1; sx <= 8; sx++) {
            var square = rank.squares[sx];

            if (!square.piece) continue;
            var isKing = square.piece.name === "King" && square.piece.isWhite === checkWhite;
            if (isKing) kingSquare = square;
        }
    }


    if (!kingSquare) throw new Error("Unable to locate opposing king");

    var attackFilter = (move: Move) => move.to.file === kingSquare.file && move.to.rank === kingSquare.rank;
    var kingAttackers = boardState.moves.filter(attackFilter);

    var isInCheck = kingAttackers.length > 0;
    return isInCheck;
}

function fiftyMoveRule(state: BoardState, board: Engine) {
    if (state.moveHistory.length < 50) return false;
    var lastFiftyMoves = state.moveHistory.slice(-50);

    return !lastFiftyMoves.some(isPawn)
}

function isPawn(move: MoveHistory) {
    return move.piece.notation === "p";
}