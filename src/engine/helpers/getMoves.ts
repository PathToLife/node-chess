import getPaths = require("./getPaths");
export = getMoves;

function getMoves(coordinate: Chess.Coordinate): Chess.Coordinate[] {
    var stopwatch = Date.now();
    var self: Chess.Engine = this;
    var square: Chess.Square = self.getSquare(coordinate);
    
    // No piece, no moves.
    var piece = square.piece;
    if (!piece) return [];
    if (piece.isWhite !== self.whitesTurn) return [];
    var bounds = { file: this.fileCount, rank: this.rankCount };

    function isValidPath(path: Chess.Coordinate[], move: Chess.MovePattern): boolean {
        // TODO: Rules API would be used here
        var isWhite = !!piece.isWhite;
        var lastCoordinateIndex = path.length - 1;
        var lastCoordinate = path[lastCoordinateIndex];
        var lastSquare = self.getSquare(lastCoordinate);
        
        // Optimisations
        
        // Ensure all squares leading up to the destination are vacant
        if (!move.canJump) {
            var isPathVacant = path.slice(0, -1).every(coord => !self.getSquare(coord).piece);
            if (!isPathVacant) return false;
        }

        // Destination occupied optimisations        
        if (!!lastSquare.piece) {
            
            // Can't land on your own piece
            if (!!isWhite === !!lastSquare.piece.isWhite) return false;
            
            // Must be able to capture if pieces are opposing colours
            if (!move.canCapture) return false;
        }
        
        // Destination unoccupied optimisations
        else {
            if (!move.canMove) return false;
        }

        return true;
    }

    var pathings: Array<Chess.Coordinate[]> = [];

    var movePatterns = piece.movement.slice(0);
    
    movePatterns.forEach(move => {
        var newPathings = getPaths(coordinate, move, piece.isWhite, bounds);
        var validPathings = newPathings.filter(pathing => isValidPath(pathing, move));
        pathings = pathings.concat(validPathings);
    });
    
    var moves = pathings.map(pathing => {
        return pathing[pathing.length - 1];
    });
    return moves;
}