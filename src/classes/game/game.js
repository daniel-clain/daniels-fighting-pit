"use strict";
exports.__esModule = true;
var Game = /** @class */ (function () {
    function Game(groupId, playerSocketIds) {
        this.groupId = groupId;
        this.playerSocketIds = playerSocketIds;
        console.log(this.groupId, this.playerSocketIds);
    }
    return Game;
}());
exports.Game = Game;
