"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const engine_2 = require("./engine/instances/classic/engine");
const enums_1 = require("./enums");
const chess = {
    Direction: enums_1.Direction,
    Engine: engine_1.default,
    classic: {
        engine: engine_2.default,
    }
};
exports.default = chess;
//# sourceMappingURL=index.js.map