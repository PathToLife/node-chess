var PEG = require("pegjs");
var parser = PEG.buildParser("\n\tStart\n\t= r:RankList WS t:Turn WS c:Castling WS Enpassant WS h:HalfMove WS m:Move\n\t{ return {\n\tranks: r,\n\tturn: t,\n\tcastling: c,\n\thalfMove: h,\n\tfullMove: t };\n\t}\n\tRankList\n\t= head:Rank \"/\" tail:RankList { return [].concat(head,tail); }\n\t/ Rank\n\n\tRank\n\t= rank:[a-zA-Z0-9]+ { return rank.join(''); }\n\n\tWS\n\t= \" \"* { return null; }\n\n\tTurn\n\t= turn:[w|b] { return turn }\n\n\tCastling\n\t= [k|q|K|Q|\"-\"]+\n\n\tEnpassant\n\t= [a-h1-8]{1}\n\t/ \"-\"\n\n\tHalfMove\n\t= [0-9]+\n\n\tMove\n\t= [0-9]+\n");
module.exports = parser;
//# sourceMappingURL=fen.js.map