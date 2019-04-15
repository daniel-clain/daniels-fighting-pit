import { MajorActions } from "./majorActions";
import { MinorActions } from "./minorActions";
import { FighterStates } from "./fighterStates";

export type FighterModelStates = MajorActions | MinorActions | FighterStates | 'walking'