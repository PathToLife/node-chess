"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const pawn_1 = require("./pawn");
const knight_1 = require("./knight");
const bishop_1 = require("./bishop");
const rook_1 = require("./rook");
const queen_1 = require("./queen");
const king_1 = require("./king");
const rules_1 = require("./rules");
/**
 * Engine Definition for classic chess
 */
function classEngine() {
    const board = new index_1.default();
    board.pieceDefinitions = [
        pawn_1.pawn, knight_1.knight, bishop_1.bishop, rook_1.rook, queen_1.queen, king_1.king
    ];
    board.parseFenString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.postSuccessfulMoveFunctions = [rules_1.postSuccessfulMoveFunction];
    board.boardState.postMoveFunctions.push(rules_1.postMoveFunction);
    return board;
}
exports.default = classEngine;
//# sourceMappingURL=engine.js.map