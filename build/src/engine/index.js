"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toString_1 = require("./helpers/toString");
const getMoves_1 = require("./helpers/getMoves");
const inferMoves_1 = require("./helpers/inferMoves");
const movePiece_1 = require("./helpers/movePiece");
const fen_1 = require("./parsers/fen");
const createSquares_1 = require("./helpers/createSquares");
const basePiece_1 = require("./basePiece");
const availableMoves_1 = require("./helpers/availableMoves");
const getSquare_1 = require("./helpers/getSquare");
const createPiece_1 = require("./helpers/createPiece");
/**
 * Board: extensible board (TODO: more detail)
 */
class Engine {
    constructor() {
        this.uciEngine = null;
        this.rankCount = 8;
        this.fileCount = 8;
        this.postMoveFunctions = [];
        this.boardState = {
            ranks: [],
            tags: {},
            capturedPieces: [],
            whitesTurn: true,
            moveNumber: 1,
            preMoveFunctions: [],
            postMoveFunctions: [],
            moves: [],
            moveHistory: []
        };
        this.pieceDefinitions = [];
        this.pieceFactory = basePiece_1.default;
        this.parseFenString = fen_1.parseFromFenString.bind(this);
        this.stringifyFenString = fen_1.stringifyToFenString.bind(this);
        this.movePiece = movePiece_1.default.bind(this);
        this.calculateMovePiece = movePiece_1.calculateMovePiece.bind(this);
        this.getSquare = getSquare_1.default.bind(this);
        this.getMoves = getMoves_1.default.bind(this);
        this.create = createSquares_1.default.bind(this);
        this.inferMoves = inferMoves_1.default.bind(this);
        this.toString = toString_1.default.bind(this);
        this.populateAvailableMoves = availableMoves_1.default.bind(this);
        this.createPiece = createPiece_1.default.bind(this);
        this.analyzer = (uciEngine) => {
            this.uciEngine = uciEngine;
        };
    }
}
exports.default = Engine;
//# sourceMappingURL=index.js.map