import Engine from '../../index';
import King from './king';
import Pawn from './pawn';
import {
    BoardState,
    Move,
    Square,
    MoveHistory,
    BoardFunctionAction,
    BoardPiece,
    MoveFunction, BoardFunctionCommandReturn,
} from '../../../types';

/**
 * Classic Chess Game Rules
 */

/**
 * Checks if player is still in check after a move
 */
export const postMoveFunction: MoveFunction = {
    action: (piece: BoardPiece, boardState: BoardState, board: Engine): BoardFunctionCommandReturn | void => {
        return isCheck(boardState.whitesTurn, boardState).length > 0 ? 'nullifyMoveDoesNotSolveCheck' : undefined;
    }
}

const postSuccessfulMoveFunction: MoveFunction<BoardFunctionAction> = {
    action: (piece: BoardPiece | null, boardState: BoardState, board: Engine) => {
        return processIsGameOver(boardState, board);
    }
}

export default postSuccessfulMoveFunction

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
function isMoveAllowed(move: Move, boardState: BoardState, board: Engine) {
    const turn = boardState.whitesTurn;
    if (turn !== move.isWhite) return false;

    try {
        // Try get future board state
        const res = board.calculateMovePiece(move, boardState);
        if (!res) return false;

        // In check
        const check = isCheck(turn, res.newBoardState);
        return check.length === 0;
    } catch (ex) {
        // No king due to being captured
        return false;
    }
}

/**
 * Get all possible moves on the board
 * @param boardState
 * @param board
 */
function allowedMoves(boardState: BoardState, board: Engine) {
    return boardState.moves.filter(
        move => isMoveAllowed(move, boardState, board)
    );
}

/**
 * Checks if the game is over and assigns the associated states
 * @param boardState
 * @param board
 */
function processIsGameOver(boardState: BoardState, board: Engine) {

    const fiftyMoveStalemate = fiftyMoveRule(boardState);

    if (fiftyMoveStalemate) {
        boardState.gameIsDrawn = true;
        boardState.moves = []; // this should be already set to empty?
        boardState.tags.gameEndReason = "50RuleDraw";
        return true;
    }

    const inCheckSquares = isCheck(boardState.whitesTurn, boardState);
    boardState.tags.inCheckSquares = inCheckSquares;

    const moves = allowedMoves(boardState, board);

    const hasMoves = moves.length > 0;
    if (hasMoves) return false;

    boardState.moves = [];
    if (inCheckSquares.length > 0) {
        boardState.winnerIsWhite = !boardState.whitesTurn
        boardState.tags.gameEndReason = boardState.whitesTurn ? "WhiteWinCheckMate" : "BlackWinCheckMate";
    } else {
        boardState.gameIsDrawn = true;
        boardState.tags.gameEndReason = "OutOfMovesDraw";
    }
    return true;
}

/**
 * Check if side is inCheck given a board state, and returns squares in question
 * @param checkWhite
 * @param boardState
 */
function isCheck(checkWhite: boolean, boardState: BoardState): Move[] {

    let kingSquare: Square | undefined = undefined;

    for (let rx = 1; rx <= 8; rx++) {
        const rank = boardState.ranks[rx];

        for (let sx = 1; sx <= 8; sx++) {
            const square = rank.squares[sx];
            if (!square.piece) continue;

            const isKing = square.piece.name === "King" && square.piece.isWhite === checkWhite;
            if (isKing) kingSquare = square;
        }
    }

    if (!kingSquare) throw Error("Unable to locate opposing king");

    return boardState.moves.filter((move) => {
        if (move.isWhite === checkWhite) return false;
        return kingSquare && move.to.file === kingSquare.file && move.to.rank === kingSquare.rank;
    });
}

function fiftyMoveRule(state: BoardState) {
    if (state.moveHistory.length < 50) return false;
    const lastFiftyMoves = state.moveHistory.slice(-50);

    return !lastFiftyMoves.some(isPawn)
}

function isPawn(move: MoveHistory) {
    return move.piece.notation === Pawn.notation;
}
