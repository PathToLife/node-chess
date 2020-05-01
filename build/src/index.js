"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const engine_2 = require("./engine/instances/classic/engine");
const enums_1 = require("./enums");
var toString_1 = require("./engine/helpers/toString");
exports.boardToString = toString_1.boardToString;
__export(require("./types"));
var bishop_1 = require("./engine/instances/classic/bishop");
exports.bishop = bishop_1.bishop;
var king_1 = require("./engine/instances/classic/king");
exports.king = king_1.king;
var knight_1 = require("./engine/instances/classic/knight");
exports.knight = knight_1.knight;
var pawn_1 = require("./engine/instances/classic/pawn");
exports.pawn = pawn_1.pawn;
var queen_1 = require("./engine/instances/classic/queen");
exports.queen = queen_1.queen;
var rook_1 = require("./engine/instances/classic/rook");
exports.rook = rook_1.rook;
exports.classicRules = require("./engine/instances/classic/rules");
const chess = {
    Direction: enums_1.Direction,
    Engine: engine_1.default,
    classic: {
        engine: engine_2.default,
    }
};
exports.default = chess;
//# sourceMappingURL=index.js.map