import classicEngine from '../src/engine/instances/classic/engine';
import {expect} from 'chai';

describe("fen parsing tests", () => {
	// Build a basic board with a pawn a valid piece
	const classicEngine1 = classicEngine();

	// Initialise the board with the default string position
	classicEngine1.parseFenString();

	it("will have a pawn at 7,2", () => {
		const rankEight = classicEngine1.boardState.ranks[7];
		const fileOne = rankEight.squares[2];
		expect(fileOne.piece).to.exist;
	});

	it("will generate default classic chess fen string", () => {
		const s = classicEngine1.stringifyFenString()
		expect(s).to.equal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
	})
});
