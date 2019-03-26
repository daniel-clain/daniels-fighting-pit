import { Component } from '@stencil/core';
import { Fighter } from '../../../../classes/fighter/fighter';


@Component({
    tag: 'fighter-component',
    shadow: true
  })
export class FighterComponent {
  constructor(private fighter: Fighter){
    console.log('fighter.name :', this.fighter.name);
  }    
  
}