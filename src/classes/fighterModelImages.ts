import { FighterModelImage } from "../models/fighterModelImage";

export const fighterModelImages: FighterModelImage[] = [
  {
    modelState: 'active',
    dimensions: { width: 58, height: 92 },
    imageName: 'idle.png'
  },
  {
    modelState: 'punching',
    dimensions: { width: 63, height: 79 },
    imageName: 'punch.png'
  },
  {
    modelState: 'critical striking',
    dimensions: { width: 87, height: 86 },
    imageName: 'kick.png'
  },
  {
    modelState: 'knocked out',
    dimensions: { width: 80, height: 40 },
    imageName: 'down-and-out.png'
  },
  {
    modelState: 'dodging',
    dimensions: { width: 49, height: 79 },
    imageName: 'dodge.png'
  },
  {
    modelState: 'blocking',
    dimensions: { width: 53, height: 74 },
    imageName: 'block.png'
  },
  {
    modelState: 'defending',
    dimensions: { width: 53, height: 74 },
    imageName: 'block.png'
  },
  {
    modelState: 'taking a hit',
    dimensions: { width: 56, height: 83 },
    imageName: 'take-hit.png'
  },
  {
    modelState: 'walking',
    dimensions: { width: 41, height: 93 },
    imageName: 'walking.png'
  },
  {
    modelState: 'recovering',
    dimensions: { width: 45, height: 67 },
    imageName: 'recover.png'
  }
]