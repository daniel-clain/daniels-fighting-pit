import { Component, Prop } from '@stencil/core';
import { RoundNews } from '../../../models/roundNews';


@Component({
  tag: 'news-component',
  shadow: true
})
export class NewsComponent {
  @Prop() roundNews: RoundNews[];

  render() {
    return (
      <div>
        <h1>Round News</h1>
      </div>
    );
  }
}
