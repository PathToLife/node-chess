export = pawn;

var firstMovePattern = {
	moves: [{ direction: Chess.Direction.Up, count: 2 }],
	canJump: false,
	canCapture: false,
	canMove: true
}

var firstMove: Chess.ConditionalMovement = {
	action: (piece) => {
		if (piece.moveHistory.length === 0) return firstMovePattern;
		return null;
	}
}

var enpassantCapture: Chess.ConditionalMovement = {
	action: (piece, board) => {
		var leftSquare = piece.getRelativeDestinations(Chess.Direction.DiagonalUpLeft, 1)[0];
		var rightSquare = piece.getRelativeDestinations(Chess.Direction.DiagonalUpRight, 1)[0];
		
	}
}

var allowEnpassantCapture: Chess.ConditionalMovement = {
    action: function (piece, board) {
		// Only apply the 'EnPassant' tag if this is the first move and we moved 2 squares
        if (piece.moveHistory.length !== 1) return null;
        var move = piece.moveHistory[0];
        var squaresMoved = Math.abs(move.from.rank - move.to.rank);
        if (squaresMoved !== 2) return null;
        
		// Find the middle square between the originating and desination squares for tagging
		var coordinateToTag = piece.getRelativeDestinations(Chess.Direction.Down, 1)[0];
		var squareToTag = board.getSquare(coordinateToTag);
        squareToTag.tags.push({ enPassant: piece.isWhite });
		
		//TODO: Add PostMoveFunction to board to remove the tag after the next move.
    }
};

var moveForward = {
	moves: [{ direction: Chess.Direction.Up, count: 1 }],
	canJump: false,
	canCapture: false,
	canMove: true
}

var moveCapture = {
	moves: [{ direction: Chess.Direction.DiagonalUp, count: 1 }],
	canJump: false,
	canCapture: true,
	canMove: false
}

var forward: Chess.SingleMove = {
	direction: Chess.Direction.Up,
	count: 1
}

var pawn: Chess.Piece = {
	location: null,
	name: "Pawn",
	movement: [moveForward, moveCapture],
	canQueen: true,
	canSpawn: false,
	value: 1,
	conditionalMoves: [firstMove],
	notation: "p",
	postMoveFunctions: [allowEnpassantCapture]
}

