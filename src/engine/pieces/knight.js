var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Direction = require("../../direction");
var helper = require("./helper");
var BaseFactory = require("../baseFactory");
var KnightFactory = (function (_super) {
    __extends(KnightFactory, _super);
    function KnightFactory() {
        var piece = {
            name: "Knight",
            movement: [horzThenVert, vertThenHorz],
            canQueen: false,
            canSpawn: true,
            value: 3,
            notation: "n",
            moveHistory: []
        };
        _super.call(this, piece);
    }
    return KnightFactory;
})(BaseFactory);
var horzThenVert = helper.createMove([{ direction: Direction.Horizontal, count: 2 }, { direction: Direction.Vertical, count: 1 }], true, true, true);
var vertThenHorz = helper.createMove([{ direction: Direction.Vertical, count: 2 }, { direction: Direction.Horizontal, count: 1 }], true, true, true);
module.exports = KnightFactory;
//# sourceMappingURL=knight.js.map