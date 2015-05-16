var getTransforms = require("./helpers/getTransforms");
var applyTransform = require("./helpers/applyTransform");
var BasePiece = (function () {
    function BasePiece(piece, notation) {
        this.isWhite = notation === piece.notation.toUpperCase();
        this.name = piece.name;
        this.movement = piece.movement;
        this.canQueen = piece.canQueen;
        this.canSpawn = piece.canSpawn;
        this.value = piece.value;
        this.notation = notation;
        this.conditionalMoves = piece.conditionalMoves || [];
        this.moveHistory = [];
        this.postMoveFunctions = piece.postMoveFunctions || [];
    }
    BasePiece.prototype.getConditionalMoves = function (board) {
        var _this = this;
        var movePatterns = [];
        this.conditionalMoves.forEach(function (move) {
            var patterns = move.action(_this, board);
            if (!patterns)
                return;
            movePatterns = movePatterns.concat(patterns);
        });
        return movePatterns;
    };
    BasePiece.prototype.getRelativeDestinations = function (direction, count) {
        var _this = this;
        var transforms = getTransforms({ direction: direction, count: count }, this.isWhite);
        var destinations = transforms.map(function (transform) { return applyTransform(_this.location, transform); });
        return destinations;
    };
    return BasePiece;
})();
module.exports = BasePiece;
//# sourceMappingURL=basePiece.js.map