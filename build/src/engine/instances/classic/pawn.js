"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queen_1 = require("./queen");
const inferMoves_1 = require("../../helpers/inferMoves");
/**
 * Pawn with enpassant, promote, first-move support
 */
const moveForward = {
    canMove: true,
    transforms: { file: 0, rank: 1 },
    postMoveAction: {
        action: (piece, state, board) => {
            const move = state.moveHistory.slice(-1)[0];
            if (!move || move.to.rank !== 1 && move.to.rank !== 8)
                return;
            const promotionNotation = (move.options || queen_1.default.notation).toLowerCase();
            let promotionPiece = board.pieceDefinitions.filter(p => p.notation === promotionNotation)[0];
            if (!promotionPiece) {
                promotionPiece = board.pieceDefinitions.filter(p => p.notation === queen_1.default.notation)[0];
            }
            piece.canQueen = false;
            piece.canSpawn = true;
            piece.movement = promotionPiece.movement;
            piece.notation = promotionPiece.notation;
            piece.postMoveFunctions = promotionPiece.postMoveFunctions;
            piece.value = promotionPiece.value;
            piece.name = promotionPiece.name;
        }
    }
};
const firstMove = {
    canMove: true,
    transforms: { file: 0, rank: 2 },
    preCondition: (piece, boardState) => boardState.moveHistory.filter(m => m.piece.id === piece.id).length === 0,
    postMoveAction: {
        action: (piece, state, board) => {
            const coordBehindPawn = piece.getRelativeDestination({ file: 0, rank: -1 });
            const squareBehindPawn = board.getSquare(coordBehindPawn, state);
            squareBehindPawn.tags["enpassant"] = true;
            state.postMoveFunctions.push({
                moveNumber: state.moveNumber + 1,
                action: (piece, innerState, innerBoard) => {
                    const sq = innerBoard.getSquare({ file: coordBehindPawn.file, rank: coordBehindPawn.rank }, innerState);
                    delete sq.tags["enpassant"];
                }
            });
        }
    }
};
const leftCapture = {
    canCapture: true,
    transforms: { file: 1, rank: 1 }
};
const rightCapture = {
    canCapture: true,
    transforms: { file: -1, rank: 1 }
};
const makeEnpassantPreMove = (dir) => {
    return (piece, state, board) => {
        const coord = piece.getRelativeDestination(dir);
        if (!inferMoves_1.isInBounds(coord))
            return false;
        const sq = board.getSquare(coord, state);
        return !!sq.tags["enpassant"];
    };
};
const enpassantPostMove = (piece, state, board) => {
    const coord = piece.getRelativeDestination({ file: 0, rank: -1 });
    const square = board.getSquare(coord, state);
    if (square.piece === null)
        throw Error(`enpassant postMove fail, expected target piece to be on square ${coord.rank} ${coord.file}, instead got null`);
    state.capturedPieces.push(square.piece);
    square.piece = null;
};
const leftEnpassant = {
    canCapture: true,
    transforms: { file: -1, rank: 1 },
    preCondition: makeEnpassantPreMove({ file: -1, rank: 1 }),
    postMoveAction: {
        action: enpassantPostMove
    }
};
const rightEnpassant = {
    canCapture: true,
    transforms: { file: 1, rank: 1 },
    preCondition: makeEnpassantPreMove({ file: 1, rank: 1 }),
    postMoveAction: {
        action: enpassantPostMove
    }
};
const pawn = {
    notation: "p",
    name: "Pawn",
    movement: [moveForward, firstMove, leftCapture, rightCapture, leftEnpassant, rightEnpassant],
    canQueen: true,
    canSpawn: false,
    value: 1,
    postMoveFunctions: []
};
exports.default = pawn;
//# sourceMappingURL=pawn.js.map