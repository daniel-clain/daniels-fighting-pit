export class News{
  newsFinished
  constructor(){}
  start(){
    this.showHeadlines()
    return new Promise(resolve => this.newsFinished = resolve);
  }

  private showHeadlines(){
    setTimeout(() => this.newsFinished(), 1000);
  }
}