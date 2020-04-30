"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the piece in engine definition and initializes it at the given location
 * @throws Error piece not found
 * @param notation
 * @param location
 */
function createPiece(notation, location) {
    const matchingPiece = this.pieceDefinitions.filter(p => p.notation === notation.toLocaleLowerCase());
    if (matchingPiece.length === 0)
        throw Error('piece not found');
    // Update Piece Count on the boardState, and get ID of the piece
    let count = this.boardState.tags["pieceCount"] || 0;
    count++;
    this.boardState.tags["pieceCount"] = count;
    // Create the piece, set id to be the above
    const newPiece = new this.pieceFactory(matchingPiece[0], notation);
    newPiece.id = count;
    // Set location, no collision detection??
    newPiece.location = location;
    return newPiece;
}
exports.default = createPiece;
//# sourceMappingURL=createPiece.js.map