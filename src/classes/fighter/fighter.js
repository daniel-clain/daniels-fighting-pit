"use strict";
exports.__esModule = true;
var fighterStates_1 = require("../../enums/fighterStates");
/* import { Subject } from "rxjs";
import { FighterLevels } from "../../models/fighterLevels";
import { Hit } from "../../models/hit"; */
var XY = /** @class */ (function () {
    function XY() {
    }
    return XY;
}());
var Fighter = /** @class */ (function () {
    /* fighterStateSubject: Subject<FighterStates> = new Subject();
    fighterLevels: FighterLevels = {
      stamina: 100,
      spirit: 100,
    };
  
    strength: number;
    speed: number;
    aggression: number;
   */
    function Fighter() {
        this.fighterState = fighterStates_1.FighterStates['ready to fight'];
        //this.setRandomProperties()
    }
    return Fighter;
}());
exports.Fighter = Fighter;
