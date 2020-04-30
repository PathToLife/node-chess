"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegjs_1 = require("pegjs");
const parser = pegjs_1.generate(`
	Start
	= WS r:RankList WS t:Turn WS c:Castling WS Enpassant WS h:HalfMove WS m:Move WS
	{ return {
	ranks: r,
	turn: t,
	castling: c,
	halfMove: h,
	fullMove: t };
	}
	RankList
	= head:Rank "/" tail:RankList { return [].concat(head,tail); }
	/ Rank

	Rank
	= rank:[a-zA-Z0-9]+ { return rank.join(''); }

	WS
	= " "* { return null; }

	Turn
	= turn:[w|b] { return turn }

	Castling
	= castling:[k|q|K|Q|-]+ { return castling.filter(function(c) { return c !== '-'; }); }

	Enpassant
	= ([a-h]{1})([1-8]{1})
	/ "-"

	HalfMove
	= [0-9]+

	Move
	= [0-9]+
`);
exports.default = parser;
//# sourceMappingURL=fen.js.map