"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe("benchmarks", function () {
    this.timeout(60000);
    var engines = [];
    var times = 100;
    it(`will create a classic board ${times} times`, () => {
        for (var x = 0; x < times; x++) {
            engines.push(src_1.default.classic.engine());
        }
    });
    it(`will move a2-a3 ${times} times`, () => {
        var times = engines.map(e => {
            var timer = new Timer();
            e.movePiece({ from: { file: 2, rank: 2 }, to: { file: 2, rank: 3 } });
            return timer.stop();
        });
        // console.log(JSON.stringify(times));
    });
});
class Timer {
    constructor() {
        this.startTime = Date.now();
        this.stop = () => Date.now() - this.startTime;
    }
}
//# sourceMappingURL=benchmark.spec.js.map