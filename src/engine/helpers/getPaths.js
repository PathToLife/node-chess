var isInBounds = require("./isInBounds");
var getTransforms = require("./getTransforms");
function getPaths(coordinate, movePattern, isWhite, bounds) {
    // TODO: Refactor
    var move = movePattern.moves[0];
    var transforms = getTransforms(move, isWhite);
    var pathings = getPathingForTransforms(coordinate, transforms, move.count, bounds);
    if (!movePattern.moves[1])
        return pathings;
    transforms = getTransforms(movePattern.moves[1], isWhite);
    var joinedPathings = [];
    for (var p in pathings) {
        var pathing = pathings[p];
        var nextPathings = getPathingForTransforms(pathing[pathing.length - 1], transforms, movePattern.moves[1].count, bounds);
        joinedPathings = joinedPathings.concat(combinePathings(pathing, nextPathings));
    }
    console.log(joinedPathings);
    return joinedPathings;
}
function getPathingForTransforms(coordinate, transforms, count, bounds) {
    var paths = [];
    // If the count is 0, return paths for 1 to [bound of the board]
    if (count === 0) {
        var max = Math.max(bounds.file, bounds.rank);
        for (var i = 1; i <= max; i++) {
            paths = paths.concat(getPathingForTransforms(coordinate, transforms, i, bounds));
        }
        return paths;
    }
    // TODO: Refactor
    transforms.forEach(function (transform) {
        var newPath = [];
        for (var i = 1; i <= count; i++) {
            newPath.push({
                file: coordinate.file + (transform.file * i),
                rank: coordinate.rank + (transform.rank * i)
            });
        }
        if (newPath.every(function (coord) { return isInBounds(coord, bounds); }))
            paths.push(newPath);
    });
    return paths;
}
function combinePathings(leftPathings, rightPathings) {
    var pathings = [];
    rightPathings.forEach(function (rightPathing) {
        var newPathing = leftPathings.slice(0);
        pathings.push(newPathing.concat(rightPathing));
    });
    return pathings;
}
module.exports = getPaths;
//# sourceMappingURL=getPaths.js.map