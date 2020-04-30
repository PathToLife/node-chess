"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasePiece {
    constructor(piece, notation) {
        this.id = 0;
        this.isWhite = notation === piece.notation.toUpperCase();
        this.name = piece.name;
        this.movement = piece.movement;
        this.canQueen = piece.canQueen;
        this.canSpawn = piece.canSpawn;
        this.value = piece.value;
        this.notation = notation;
        this.moveHistory = [];
        this.postMoveFunctions = piece.postMoveFunctions || [];
        this.location = { rank: 0, file: 0 };
    }
    getRelativeDestination(transform) {
        return applyTransform(transform, this.location, this.isWhite);
    }
    getAbsoluteDestination(transform) {
        return applyTransform(transform, this.location, true);
    }
}
exports.default = BasePiece;
function applyTransform(transform, position, isWhite) {
    const modifier = isWhite ? 1 : -1;
    return {
        file: position.file + (transform.file * modifier),
        rank: position.rank + (transform.rank * modifier)
    };
}
//# sourceMappingURL=basePiece.js.map