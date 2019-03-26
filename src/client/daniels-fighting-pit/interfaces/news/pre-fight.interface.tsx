import { Component, Prop } from '@stencil/core';
import { RoundNews } from '../../../../models/roundNews';


@Component({
  tag: 'news-headlines-interface',
  shadow: true
})
export class NewsHeadlinesInterface {
  @Prop() roundNews: RoundNews[];

  render() {
    return (
      <div>
        <h1>Round News</h1>
      </div>
    );
  }
}
