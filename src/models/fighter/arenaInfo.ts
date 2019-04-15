import { Dimensions } from "./dimensions";
import { Subject } from "rxjs";

export interface ArenaInfo{
  dimensions: Dimensions
  dimensionUpdates: Subject<Dimensions>
}