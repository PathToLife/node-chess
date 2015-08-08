var classicEngine = require("../src/engine/instances/classic");
var chai = require("chai");
var expect = chai.expect;
describe("fen parsing tests", function () {
    // Build a basic board with a pawn a valid piece
    var engine = classicEngine();
    // Initialise the board with the default string position
    engine.positionParser();
    it("will have a pawn at 7,2", function () {
        var rankEight = engine.boardState.ranks[7];
        var fileOne = rankEight.squares[2];
        expect(fileOne.piece).to.exist;
    });
});
//# sourceMappingURL=fen-parser.js.map